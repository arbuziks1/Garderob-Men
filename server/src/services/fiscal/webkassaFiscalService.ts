import type { Order } from '@prisma/client';
import crypto from 'node:crypto';
import type { FiscalProvider } from './FiscalProvider';

/**
 * Real Webkassa/Rekassa integration — NOT usable yet, same reason as KaspiPayService:
 * no API key/cashbox has been issued. Fill in once WEBKASSA_API_KEY and
 * WEBKASSA_CASHBOX_ID are set.
 *
 * Expected real flow (Webkassa's typical REST API shape — confirm exact endpoint
 * names against their current docs before relying on this):
 *   POST {WEBKASSA_BASE_URL}/Check with the cashbox id, API key, items (title,
 *   price, quantity) and payment method -> returns a check/receipt number you then
 *   fetch a printable/shareable URL for.
 */
export class WebkassaFiscalService implements FiscalProvider {
  async issueReceipt(_order: Order): Promise<{ receiptNumber: string; receiptUrl: string }> {
    // TODO: once WEBKASSA_API_KEY / WEBKASSA_CASHBOX_ID are issued —
    //   const res = await fetch(`${WEBKASSA_BASE_URL}/Check`, {
    //     method: 'POST',
    //     body: JSON.stringify({ CashboxUniqueNumber: process.env.WEBKASSA_CASHBOX_ID, ... }),
    //   });
    throw new Error('WebkassaFiscalService.issueReceipt: not implemented — pending Webkassa/Rekassa API key');
  }
}

/** Used while there's no real fiscal provider key configured — produces an
 *  obviously-fake, clearly-labelled receipt number so the order record and the UI
 *  have something real-shaped to display during development/demo. */
export class MockFiscalService implements FiscalProvider {
  async issueReceipt(order: Order): Promise<{ receiptNumber: string; receiptUrl: string }> {
    const receiptNumber = `MOCK-${order.id.slice(0, 8).toUpperCase()}-${crypto.randomInt(1000, 9999)}`;
    return {
      receiptNumber,
      receiptUrl: `https://example-ofd.test/receipts/${receiptNumber}`,
    };
  }
}
