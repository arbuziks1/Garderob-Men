import type { Order } from '@prisma/client';

export interface WebhookResult {
  orderId: string;
  status: 'paid' | 'failed';
  transactionId: string;
}

/**
 * One implementation per payment provider. Right now there's only Kaspi Pay (real,
 * pending bank approval) and a Mock one used for local/demo testing until then.
 * Swapping providers, or adding a second one later, should never require touching
 * the routes that call this interface.
 */
export interface PaymentProvider {
  /** Where to send the customer to pay this order. */
  createPaymentLink(order: Order): Promise<{ redirectUrl: string }>;

  /** Verify + parse an inbound webhook call from the provider. Throw if the
   *  signature doesn't check out — the route layer turns that into a 401. */
  handleWebhook(payload: unknown, signatureHeader: string | undefined): Promise<WebhookResult>;

  /** Ask the provider directly what an order's payment status is (polling fallback,
   *  not used by the main flow but part of the contract so a real integration can
   *  reconcile against missed webhooks). */
  checkStatus(orderId: string): Promise<{ status: 'pending' | 'paid' | 'failed' }>;

  /** Refund a paid order. Not wired to any route yet — the admin panel doesn't
   *  expose refunds in this phase, but the interface has it so adding that button
   *  later is a route + one call, not a redesign. */
  refund(orderId: string): Promise<{ refunded: boolean }>;
}
