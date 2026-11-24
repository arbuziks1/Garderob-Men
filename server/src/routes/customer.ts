import bcrypt from 'bcrypt';
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { signCustomerToken } from '../lib/jwt';
import { normalizePhone } from '../lib/phone';
import { requireCustomer } from '../middleware/requireCustomer';
import { serializeOrderFull } from '../lib/serializers';

export const customerRouter = Router();

customerRouter.post('/register', async (req, res) => {
  const { phone, password } = req.body as { phone?: string; password?: string };
  if (!phone || !password) {
    res.status(400).json({ error: 'phone and password are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const normalizedPhone = normalizePhone(phone);

  const existing = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
  if (existing) {
    res.status(409).json({ error: 'this phone is already registered' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({ data: { phone: normalizedPhone, passwordHash } });

  const token = signCustomerToken({ sub: customer.id, phone: customer.phone });
  res.status(201).json({ token, phone: customer.phone });
});

customerRouter.post('/login', async (req, res) => {
  const { phone, password } = req.body as { phone?: string; password?: string };
  if (!phone || !password) {
    res.status(400).json({ error: 'phone and password are required' });
    return;
  }

  const normalizedPhone = normalizePhone(phone);
  const customer = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
  if (!customer) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const ok = await bcrypt.compare(password, customer.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signCustomerToken({ sub: customer.id, phone: customer.phone });
  res.json({ token, phone: customer.phone });
});

customerRouter.get('/me', requireCustomer, async (req, res) => {
  res.json({ phone: req.customer!.phone });
});

customerRouter.get('/orders', requireCustomer, async (req, res) => {
  const customerPhone = req.customer!.phone;

  // This store is small enough that fetching every order and filtering in JS is fine —
  // out of scope to add a normalized-phone column/index just for this lookup.
  const allOrders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  const matched = allOrders.filter((order) => normalizePhone(order.phone) === customerPhone);

  const response: { orders: ReturnType<typeof serializeOrderFull>[]; bonusBalance?: number } = {
    orders: matched.map(serializeOrderFull),
  };

  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  if (settings?.bonusEnabled) {
    const deliveredTotal = matched
      .filter((order) => order.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.total, 0);
    response.bonusBalance = Math.floor((deliveredTotal * settings.bonusPercent) / 100);
  }

  res.json(response);
});
