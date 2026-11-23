import type { Order, OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { LABEL_TO_DELIVERY, LABEL_TO_PAYMENT, stockColumnForSize } from '../lib/labels';
import { getFiscalProvider } from './fiscal';

export class InsufficientStockError extends Error {
  constructor(
    public readonly item: { productId: string; colorId: string; size: string; requested: number }
  ) {
    super(`Insufficient stock for size ${item.size}`);
  }
}

export interface CreateOrderItemInput {
  productId: string;
  colorId: string;
  size: string;
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
    // Load snapshot data (title/color name/price) for the items we're about to create,
    // and the color rows so we know which to decrement.
    const colors = await tx.productColor.findMany({
      where: { id: { in: input.items.map((i) => i.colorId) } },
      include: { product: true },
    });
    const colorById = new Map(colors.map((c) => [c.id, c]));

    for (const item of input.items) {
      const color = colorById.get(item.colorId);
      if (!color || color.productId !== item.productId) {
        throw new InsufficientStockError({ ...item, requested: item.quantity });
      }
      const column = stockColumnForSize(item.size);
      if (!column) throw new Error(`Unknown size: ${item.size}`);

      const result = await tx.productColor.updateMany({
        where: { id: item.colorId, [column]: { gte: item.quantity } },
        data: { [column]: { decrement: item.quantity } },
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
        consentGiven: input.consentGiven,
        consentGivenAt: input.consentGiven ? new Date() : null,
        status: 'PENDING_PAYMENT',
        items: {
          create: input.items.map((item) => {
            const color = colorById.get(item.colorId)!;
            return {
              productId: item.productId,
              titleSnapshot: color.product.title,
              colorNameSnapshot: color.name,
              size: item.size,
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
      // OrderItem only snapshots productId + colorNameSnapshot (not colorId), so the
      // color to credit back is looked up by product + color name. If the color was
      // since renamed or deleted, this intentionally finds nothing and skips that
      // line rather than guessing — an admin can adjust stock manually in that case.
      for (const item of order.items) {
        if (!item.productId) continue;
        const column = stockColumnForSize(item.size);
        if (!column) continue;
        const color = await tx.productColor.findFirst({
          where: { productId: item.productId, name: item.colorNameSnapshot },
        });
        if (color) {
          await tx.productColor.update({ where: { id: color.id }, data: { [column]: { increment: item.quantity } } });
        }
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
