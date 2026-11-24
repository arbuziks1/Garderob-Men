import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken, type AdminTokenPayload } from '../lib/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }
  try {
    const payload = verifyAdminToken(header.slice('Bearer '.length));
    if (payload.typ !== 'admin') {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
