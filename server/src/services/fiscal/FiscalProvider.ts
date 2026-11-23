import type { Order } from '@prisma/client';

export interface FiscalProvider {
  /** Called right after an order flips to PAID. Must return a receipt
   *  number/url to store on the order — required for Kazakhstani tax law
   *  (онлайн-касса / ОФД), not optional once real payments are live. */
  issueReceipt(order: Order): Promise<{ receiptNumber: string; receiptUrl: string }>;
}
