import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET env var is required');
}
const JWT_SECRET: string = process.env.JWT_SECRET;

export interface AdminTokenPayload {
  sub: string; // AdminUser.id
  email: string;
  typ: 'admin';
}

// Admin and customer tokens are signed with the same secret (no separate secret is
// configured), so the `typ` discriminator below is what keeps a valid customer token
// from being accepted on an admin-only route (and vice versa) — never rely on the
// unchecked `as` cast alone to tell the two apart.
export function signAdminToken(payload: Omit<AdminTokenPayload, 'typ'>): string {
  return jwt.sign({ ...payload, typ: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
}

export interface CustomerTokenPayload {
  sub: string; // Customer.id
  phone: string; // normalized
  typ: 'customer';
}

export function signCustomerToken(payload: Omit<CustomerTokenPayload, 'typ'>): string {
  return jwt.sign({ ...payload, typ: 'customer' }, JWT_SECRET, { expiresIn: '12h' });
}

export function verifyCustomerToken(token: string): CustomerTokenPayload {
  return jwt.verify(token, JWT_SECRET) as CustomerTokenPayload;
}
