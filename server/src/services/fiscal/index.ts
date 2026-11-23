import type { FiscalProvider } from './FiscalProvider';
import { MockFiscalService, WebkassaFiscalService } from './webkassaFiscalService';

let instance: FiscalProvider | null = null;

export function getFiscalProvider(): FiscalProvider {
  if (!instance) {
    instance = process.env.WEBKASSA_API_KEY ? new WebkassaFiscalService() : new MockFiscalService();
  }
  return instance;
}

export type { FiscalProvider } from './FiscalProvider';
