import type { Order } from '@prisma/client';
import crypto from 'node:crypto';
import type { PaymentProvider, WebhookResult } from './PaymentProvider';

const mockStatuses = new Map<string, 'pending' | 'paid' | 'failed'>();

/**
 * Stand-in for Kaspi Pay while PAYMENT_MODE=mock (i.e. until the bank approves the
 * real merchant application). createPaymentLink points the customer at our own
 * POST /api/dev/mock-pay/:orderId instead of a real Kaspi redirect; hitting that
 * route drives the exact same handleWebhook path a real webhook would, so the whole
 * PENDING_PAYMENT -> PAID -> fiscal-receipt chain gets genuinely exercised.
 */
export class MockPaymentService implements PaymentProvider {
  async createPaymentLink(order: Order): Promise<{ redirectUrl: string }> {
    mockStatuses.set(order.id, 'pending');
    return { redirectUrl: `/api/dev/mock-pay/${order.id}` };
  }

  async handleWebhook(payload: unknown, _signatureHeader: string | undefined): Promise<WebhookResult> {
    const body = payload as { orderId?: string };
    if (!body?.orderId) throw new Error('Mock webhook payload missing orderId');
    mockStatuses.set(body.orderId, 'paid');
    return {
      orderId: body.orderId,
      status: 'paid',
      transactionId: `mock_${crypto.randomUUID()}`,
    };
  }

  async checkStatus(orderId: string): Promise<{ status: 'pending' | 'paid' | 'failed' }> {
    return { status: mockStatuses.get(orderId) ?? 'pending' };
  }

  async refund(orderId: string): Promise<{ refunded: boolean }> {
    mockStatuses.set(orderId, 'failed');
    return { refunded: true };
  }
}
