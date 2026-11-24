import type { NextFunction, Request, Response } from 'express';
import { verifyCustomerToken, type CustomerTokenPayload } from '../lib/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      customer?: CustomerTokenPayload;
    }
  }
}

export function requireCustomer(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }
  try {
    const payload = verifyCustomerToken(header.slice('Bearer '.length));
    if (payload.typ !== 'customer') {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.customer = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
