import type { Order } from '@prisma/client';
import crypto from 'node:crypto';
import type { PaymentProvider, WebhookResult } from './PaymentProvider';

/**
 * Real Kaspi Pay integration — NOT usable yet. Kaspi only issues KASPI_MERCHANT_ID /
 * KASPI_API_TOKEN after approving a merchant application, which in turn requires the
 * site to already show real prices, a working checkout, and the public
 * offer/privacy/delivery pages (see /offer, /privacy, /delivery on the frontend) —
 * this is exactly the flow described in the saler.kz "Как подключить Kaspi Pay к
 * сайту" article discussed earlier in this project.
 *
 * Expected real flow once approved:
 *   1. createPaymentLink: POST the order (amount, purpose, customer phone) to Kaspi's
 *      merchant API using KASPI_API_TOKEN as bearer auth. Kaspi pushes a pay
 *      notification to the customer's Kaspi.kz app and returns a redirect/deeplink.
 *   2. Kaspi calls our webhook (POST /api/webhooks/kaspi) when the customer pays.
 *   3. handleWebhook verifies Kaspi's signature and reports the transaction id back.
 *
 * None of steps 1–3 below can be implemented correctly without Kaspi's actual API
 * docs + merchant credentials, which don't exist yet — so they throw rather than
 * silently doing the wrong thing. Fill in the TODOs once the bank approves the
 * application and shares integration docs.
 */
export class KaspiPayService implements PaymentProvider {
  async createPaymentLink(_order: Order): Promise<{ redirectUrl: string }> {
    // TODO: once approved —
    //   const res = await fetch(`${KASPI_API_BASE}/merchant/orders`, {
    //     method: 'POST',
    //     headers: { Authorization: `Bearer ${process.env.KASPI_API_TOKEN}` },
    //     body: JSON.stringify({ merchantId: process.env.KASPI_MERCHANT_ID, amount: _order.total, ... }),
    //   });
    throw new Error('KaspiPayService.createPaymentLink: not implemented — pending Kaspi merchant approval');
  }

  async handleWebhook(_payload: unknown, _signatureHeader: string | undefined): Promise<WebhookResult> {
    // TODO: verify the real Kaspi webhook signature scheme (HMAC header name/algorithm
    // confirmed by Kaspi's integration docs once issued) before trusting _payload.
    throw new Error('KaspiPayService.handleWebhook: not implemented — pending Kaspi merchant approval');
  }

  async checkStatus(_orderId: string): Promise<{ status: 'pending' | 'paid' | 'failed' }> {
    throw new Error('KaspiPayService.checkStatus: not implemented — pending Kaspi merchant approval');
  }

  async refund(_orderId: string): Promise<{ refunded: boolean }> {
    throw new Error('KaspiPayService.refund: not implemented — pending Kaspi merchant approval');
  }
}

/** Timing-safe comparison helper the mock service (and the real one, later) use to
 *  check a shared-secret webhook signature without a timing side-channel. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
