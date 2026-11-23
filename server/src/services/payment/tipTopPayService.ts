import type { Order } from '@prisma/client';
import type { PaymentProvider, WebhookResult } from './PaymentProvider';

/**
 * Real TipTop Pay (tiptoppay.kz) integration — NOT usable yet, same situation as
 * KaspiPayService: a real integration needs a signed merchant agreement and real
 * credentials, neither of which exist yet.
 *
 * TipTop Pay Kazakhstan (ТОО TipTop Pay Kazakhstan, Astana Hub resident, live since
 * 2023) is kept here as an alternative to a direct Kaspi Pay merchant application —
 * confirmed from a live production site (widget.tiptoppay.kz / checkout.tiptoppay.kz /
 * 3ds.tiptoppay.kz all present in its CSP) that it offers a hosted checkout widget
 * covering card payments with 3-D Secure, and — per TipTop's own public description —
 * an online cash register bundled in for fiscalizing non-cash payments, which would
 * mean no separate Webkassa/Rekassa subscription if this is the provider actually used.
 * Whether it can also push a Kaspi QR/Kaspi.kz app payment (the way the direct Kaspi
 * Pay integration does) is not confirmed — check with TipTop directly before assuming
 * parity with KaspiPayService's customer-facing flow.
 *
 * Expected real flow once a merchant agreement + credentials exist (confirm every field
 * name and the exact signature scheme against TipTop's own integration docs — nothing
 * below is copied from verified documentation, it's the shape a hosted-checkout widget
 * integration like this normally takes):
 *   1. createPaymentLink: request a checkout session from TipTop's API using the
 *      terminal/merchant key, get back a redirect URL to checkout.tiptoppay.kz (or an
 *      embeddable widget token for widget.tiptoppay.kz).
 *   2. TipTop calls our webhook (POST /api/webhooks/tiptop) when the payment completes.
 *   3. handleWebhook verifies TipTop's signature (likely HMAC over the raw body with a
 *      shared secret key — confirm the header name and algorithm with TipTop) and
 *      reports the transaction id back.
 *
 * Which provider is actually used in production is a single env var switch
 * (PAYMENT_PROVIDER=kaspi|tiptop in server/.env) — see services/payment/index.ts.
 */
export class TipTopPayService implements PaymentProvider {
  async createPaymentLink(_order: Order): Promise<{ redirectUrl: string }> {
    // TODO: once a merchant agreement is signed —
    //   const res = await fetch(`${TIPTOP_API_BASE}/payments`, {
    //     method: 'POST',
    //     headers: { Authorization: `Bearer ${process.env.TIPTOP_API_KEY}` },
    //     body: JSON.stringify({ terminalKey: process.env.TIPTOP_TERMINAL_KEY, amount: _order.total, ... }),
    //   });
    throw new Error('TipTopPayService.createPaymentLink: not implemented — pending a TipTop Pay merchant agreement');
  }

  async handleWebhook(_payload: unknown, _signatureHeader: string | undefined): Promise<WebhookResult> {
    // TODO: verify the real TipTop webhook signature scheme (header name/algorithm
    // confirmed by TipTop's own integration docs once the agreement is signed) before
    // trusting _payload — do not reuse Kaspi's scheme, there is no reason to assume
    // it's the same.
    throw new Error('TipTopPayService.handleWebhook: not implemented — pending a TipTop Pay merchant agreement');
  }

  async checkStatus(_orderId: string): Promise<{ status: 'pending' | 'paid' | 'failed' }> {
    throw new Error('TipTopPayService.checkStatus: not implemented — pending a TipTop Pay merchant agreement');
  }

  async refund(_orderId: string): Promise<{ refunded: boolean }> {
    throw new Error('TipTopPayService.refund: not implemented — pending a TipTop Pay merchant agreement');
  }
}
