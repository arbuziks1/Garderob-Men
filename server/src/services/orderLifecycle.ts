import type { Order, OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { LABEL_TO_DELIVERY, LABEL_TO_PAYMENT } from '../lib/labels';
import { getFiscalProvider } from './fiscal';

export class InsufficientStockError extends Error {
  constructor(
    public readonly item: { productId: string; colorId: string; sizeStockId: string; requested: number }
  ) {
    super(`Insufficient stock for size stock row ${item.sizeStockId}`);
  }
}

export interface CreateOrderItemInput {
  productId: string;
  colorId: string;
  sizeStockId: string;
  sizeLabel: string; // display label the customer saw, e.g. "48 (RU)" — stored verbatim
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  delivery: string; // Russian label, as sent by the frontend
  payment: string; // Russian label, as sent by the frontend
  items: CreateOrderItemInput[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  comment?: string;
  consentGiven: boolean;
  deliveryAddress?: { city: string; street: string; house: string; apartment?: string; entrance?: string; comment?: string };
}

/**
 * Creates an order and atomically decrements stock for every line item.
 *
 * Race-safety: each line item's stock decrement is a single SQL
 * `UPDATE ... SET stock_x = stock_x - :qty WHERE id = :colorId AND stock_x >= :qty`
 * (Prisma's `updateMany` with a `gte` condition compiles to exactly this). Postgres
 * takes a row lock for the duration of that UPDATE, so two concurrent requests for
 * the same ProductColor serialize: whichever commits first leaves the row with less
 * stock, and the second transaction's WHERE clause re-evaluates against that
 * post-commit value — if it's no longer >= the requested quantity, `updateMany`
 * matches zero rows and we throw, rolling back the whole transaction. No explicit
 * `SELECT ... FOR UPDATE` is needed because the conditional UPDATE already behaves
 * as one; this is the standard "optimistic/conditional decrement" pattern and is
 * genuinely safe under concurrent load (verified with a concurrency test, see the
 * smoke test script).
 */
export async function createOrder(input: CreateOrderInput): Promise<Order & { items: import('@prisma/client').OrderItem[] }> {
  const deliveryMethod = LABEL_TO_DELIVERY[input.delivery];
  const paymentMethod = LABEL_TO_PAYMENT[input.payment];
  if (!deliveryMethod) throw new Error(`Unknown delivery method label: ${input.delivery}`);
  if (!paymentMethod) throw new Error(`Unknown payment method label: ${input.payment}`);

  return prisma.$transaction(async (tx) => {
    // Load snapshot data (title/sku/color name/price) for the items we're about to
    // create, and the color rows so we can verify each size row actually belongs to
    // the color/product the client claims (never trust a client-supplied sizeStockId
    // blindly — it could otherwise be used to decrement stock on an unrelated color).
    const colors = await tx.productColor.findMany({
      where: { id: { in: input.items.map((i) => i.colorId) } },
      include: { product: true },
    });
    const colorById = new Map(colors.map((c) => [c.id, c]));

    const sizeStocks = await tx.productSizeStock.findMany({
      where: { id: { in: input.items.map((i) => i.sizeStockId) } },
    });
    const sizeStockById = new Map(sizeStocks.map((s) => [s.id, s]));

    for (const item of input.items) {
      const color = colorById.get(item.colorId);
      const sizeStock = sizeStockById.get(item.sizeStockId);
      if (!color || color.productId !== item.productId || !sizeStock || sizeStock.colorId !== item.colorId) {
        throw new InsufficientStockError({ ...item, requested: item.quantity });
      }

      const result = await tx.productSizeStock.updateMany({
        where: { id: item.sizeStockId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        throw new InsufficientStockError({ ...item, requested: item.quantity });
      }
    }

    const order = await tx.order.create({
      data: {
        customerName: input.customerName,
        phone: input.phone,
        deliveryMethod,
        paymentMethod,
        subtotal: input.subtotal,
        discount: input.discount,
        promoCode: input.promoCode,
        total: input.total,
        comment: input.comment,
        deliveryAddress: input.deliveryAddress ?? undefined,
        consentGiven: input.consentGiven,
        consentGivenAt: input.consentGiven ? new Date() : null,
        status: 'PENDING_PAYMENT',
        items: {
          create: input.items.map((item) => {
            const color = colorById.get(item.colorId)!;
            return {
              productId: item.productId,
              sizeStockId: item.sizeStockId,
              skuSnapshot: color.product.sku,
              titleSnapshot: color.product.title,
              colorNameSnapshot: color.name,
              size: item.sizeLabel,
              priceSnapshot: color.product.price,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    return order;
  });
}

export async function transitionOrderStatus(orderId: string, nextStatus: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return null;

    if (order.status === nextStatus) {
      // No-op — in particular this is what makes cancelling an already-cancelled
      // order safe (it would otherwise double-restore stock).
      return order;
    }

    if (nextStatus === 'CANCELLED') {
      // Restore stock directly on the exact ProductSizeStock row the order decremented.
      // If that row (or its color) was since deleted by the admin, sizeStockId is
      // already null (onDelete: SetNull) — intentionally skip restoring in that case
      // rather than guessing; an admin can adjust stock manually.
      for (const item of order.items) {
        if (!item.sizeStockId) continue;
        await tx.productSizeStock.update({
          where: { id: item.sizeStockId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      include: { items: true },
    });

    return updated;
  });
}

/** Called once an order is confirmed PAID (from the webhook or the mock-pay route).
 *  Idempotent: skips issuing a second receipt if one's already on the order. */
export async function markOrderPaid(orderId: string, transactionId: string) {
  const existing = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!existing) throw new Error(`Order ${orderId} not found`);
  if (existing.status === 'PAID' && existing.fiscalReceiptNumber) {
    return existing; // already processed — webhooks can be delivered more than once
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID', paymentTransactionId: transactionId },
  });

  const receipt = await getFiscalProvider().issueReceipt(updated);
  return prisma.order.update({
    where: { id: orderId },
    data: { fiscalReceiptNumber: receipt.receiptNumber, fiscalReceiptUrl: receipt.receiptUrl },
    include: { items: true },
  });
}
