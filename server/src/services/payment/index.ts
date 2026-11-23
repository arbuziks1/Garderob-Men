import type { PaymentProvider } from './PaymentProvider';
import { KaspiPayService } from './kaspiPayService';
import { TipTopPayService } from './tipTopPayService';
import { MockPaymentService } from './mockPaymentService';

let instance: PaymentProvider | null = null;

/** Which real provider to use once PAYMENT_MODE=live — a direct Kaspi Pay merchant
 *  application, or TipTop Pay as the alternative acquirer (see tipTopPayService.ts for
 *  why that's an option). Defaults to 'kaspi' so existing deployments that only ever
 *  set PAYMENT_MODE don't need to change anything. */
export function getPaymentProvider(): PaymentProvider {
  if (!instance) {
    if (process.env.PAYMENT_MODE !== 'live') {
      instance = new MockPaymentService();
    } else if (process.env.PAYMENT_PROVIDER === 'tiptop') {
      instance = new TipTopPayService();
    } else {
      instance = new KaspiPayService();
    }
  }
  return instance;
}

export function isMockPaymentMode(): boolean {
  return process.env.PAYMENT_MODE !== 'live';
}

export type { PaymentProvider, WebhookResult } from './PaymentProvider';
