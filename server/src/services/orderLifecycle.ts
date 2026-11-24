import type { Order, OrderStatus, PaymentMethod } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { LABEL_TO_DELIVERY } from '../lib/labels';
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
  // Payment method is never client-supplied — see createOrder, which derives it from
  // deliveryMethod. Never trust the client on something that changes business logic.
  items: CreateOrderItemInput[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  comment?: string;
  consentGiven: boolean;
  deliveryAddress?: { city: string; street: string; house: string; apartment?: string; entrance?: string; comment?: string };
  // Required in practice for SELF_PICKUP (validated below), ignored for DELIVERY —
  // a DELIVERY order auto-picks whichever branch has stock, in PickupBranch.position order.
  pickupBranchId?: string;
}

/**
 * Creates an order and atomically decrements stock for every line item.
 *
 * Race-safety: every line item's stock decrement is a single SQL
 * `UPDATE ... SET stock = stock - :qty WHERE id = :branchStockId AND stock >= :qty`
 * (Prisma's `updateMany` with a `gte` condition compiles to exactly this). Postgres
 * takes a row lock for the duration of that UPDATE, so two concurrent requests for
 * the same BranchStock row serialize: whichever commits first leaves the row with
 * less stock, and the second transaction's WHERE clause re-evaluates against that
 * post-commit value — if it's no longer >= the requested quantity, `updateMany`
 * matches zero rows and we throw, rolling back the whole transaction. No explicit
 * `SELECT ... FOR UPDATE` is needed because the conditional UPDATE already behaves
 * as one; this is the standard "optimistic/conditional decrement" pattern and is
 * genuinely safe under concurrent load (verified with a concurrency test, see the
 * smoke test script).
 *
 * For SELF_PICKUP, the branch is client-chosen and there's exactly one conditional
 * `updateMany` per item, targeting that one BranchStock row — same shape as before.
 * For DELIVERY, there's no client-chosen branch: each candidate branch (in
 * PickupBranch.position order) gets its own conditional `updateMany`, tried in turn
 * until one actually reports `count > 0`. A candidate is only ever accepted on that
 * count, never on the plain read used to shortlist it, so the fallback loop inherits
 * the exact same race-safety property — see the DELIVERY branch below for why this
 * can't double-sell stock under concurrent requests.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order & { items: import('@prisma/client').OrderItem[] }> {
  const deliveryMethod = LABEL_TO_DELIVERY[input.delivery];
  if (!deliveryMethod) throw new Error(`Unknown delivery method label: ${input.delivery}`);

  // Payment method is derived from delivery method, never client-supplied — this closes
  // a real gap where a client could previously claim any payment label it wanted.
  const paymentMethod: PaymentMethod = deliveryMethod === 'SELF_PICKUP' ? 'CASH_ON_PICKUP' : 'CARD_ONLINE';

  if (deliveryMethod === 'SELF_PICKUP' && !input.pickupBranchId) {
    throw new Error('pickupBranchId is required for SELF_PICKUP orders');
  }

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

    let pickupBranchNameSnapshot: string | undefined;
    if (deliveryMethod === 'SELF_PICKUP') {
      const branch = await tx.pickupBranch.findUnique({ where: { id: input.pickupBranchId! } });
      if (!branch) throw new Error(`Unknown pickupBranchId: ${input.pickupBranchId}`);
      pickupBranchNameSnapshot = branch.name;
    }

    // The specific BranchStock row each item's decrement actually landed on, in the
    // same order as input.items — stored on the OrderItem below.
    const branchStockIdByItem: string[] = [];

    for (const item of input.items) {
      const color = colorById.get(item.colorId);
      const sizeStock = sizeStockById.get(item.sizeStockId);
      if (!color || color.productId !== item.productId || !sizeStock || sizeStock.colorId !== item.colorId) {
        throw new InsufficientStockError({ ...item, requested: item.quantity });
      }

      if (deliveryMethod === 'SELF_PICKUP') {
        // The client chose the branch — verify a BranchStock row for this
        // (sizeStockId, branchId) pair actually exists before trusting it (a missing
        // row and "not enough stock" fold into the same error, same as today's pattern
        // of not distinguishing "invalid id" from "insufficient stock"). The read here
        // is only to get the row's id for the OrderItem; the updateMany's count below
        // is what actually proves the decrement happened safely.
        const branchStock = await tx.branchStock.findUnique({
          where: { sizeStockId_branchId: { sizeStockId: item.sizeStockId, branchId: input.pickupBranchId! } },
        });
        if (!branchStock) {
          throw new InsufficientStockError({ ...item, requested: item.quantity });
        }

        const result = await tx.branchStock.updateMany({
          where: { sizeStockId: item.sizeStockId, branchId: input.pickupBranchId!, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new InsufficientStockError({ ...item, requested: item.quantity });
        }
        branchStockIdByItem.push(branchStock.id);
      } else {
        // DELIVERY: no client-chosen branch — try every branch that stocks this size,
        // in PickupBranch.position order, and accept the first one whose conditional
        // decrement actually succeeds (count > 0). If a candidate's updateMany comes
        // back with count 0 (another request beat us to it between the read and the
        // write), move on to the next candidate rather than assuming success from the
        // initial read — this is what keeps the fallback loop race-safe.
        const candidates = await tx.branchStock.findMany({
          where: { sizeStockId: item.sizeStockId },
          include: { branch: true },
          orderBy: { branch: { position: 'asc' } },
        });

        let decrementedInto: string | undefined;
        for (const candidate of candidates) {
          if (candidate.stock < item.quantity) continue; // cheap pre-filter from the read; not what proves safety
          const result = await tx.branchStock.updateMany({
            where: { id: candidate.id, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (result.count > 0) {
            decrementedInto = candidate.id;
            break;
          }
        }
        if (!decrementedInto) {
          throw new InsufficientStockError({ ...item, requested: item.quantity });
        }
        branchStockIdByItem.push(decrementedInto);
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
        pickupBranchId: deliveryMethod === 'SELF_PICKUP' ? input.pickupBranchId : undefined,
        pickupBranchNameSnapshot: deliveryMethod === 'SELF_PICKUP' ? pickupBranchNameSnapshot : undefined,
        consentGiven: input.consentGiven,
        consentGivenAt: input.consentGiven ? new Date() : null,
        status: 'PENDING_PAYMENT',
        items: {
          create: input.items.map((item, idx) => {
            const color = colorById.get(item.colorId)!;
            return {
              productId: item.productId,
              sizeStockId: item.sizeStockId,
              branchStockId: branchStockIdByItem[idx],
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
      // Restore stock directly on the exact BranchStock row the order decremented.
      // If that row (or its branch) was since deleted by the admin, branchStockId is
      // already null (onDelete: SetNull) — intentionally skip restoring in that case
      // rather than guessing; an admin can adjust stock manually.
      for (const item of order.items) {
        if (!item.branchStockId) continue;
        await tx.branchStock.update({
          where: { id: item.branchStockId },
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
