import type { PaymentProvider } from './PaymentProvider';
import { KaspiPayService } from './kaspiPayService';
import { MockPaymentService } from './mockPaymentService';

let instance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!instance) {
    instance = process.env.PAYMENT_MODE === 'live' ? new KaspiPayService() : new MockPaymentService();
  }
  return instance;
}

export function isMockPaymentMode(): boolean {
  return process.env.PAYMENT_MODE !== 'live';
}

export type { PaymentProvider, WebhookResult } from './PaymentProvider';
