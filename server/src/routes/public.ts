import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { serializeOrderFull, serializeOrderPublic, serializeProduct } from '../lib/serializers';
import { createOrder, InsufficientStockError, markOrderPaid } from '../services/orderLifecycle';
import { getPaymentProvider, isMockPaymentMode } from '../services/payment';
import { safeEqual } from '../services/payment/kaspiPayService';

export const publicRouter = Router();

publicRouter.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { colors: { include: { images: true, sizes: { orderBy: { position: 'asc' } } } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(products.map(serializeProduct));
});

publicRouter.get('/settings', async (_req, res) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    res.status(500).json({ error: 'Store settings have not been seeded' });
    return;
  }
  res.json(settings);
});

publicRouter.get('/promo-codes/:code', async (req, res) => {
  const code = await prisma.promoCode.findUnique({ where: { code: req.params.code.toUpperCase() } });
  if (!code || !code.active) {
    res.json({ valid: false });
    return;
  }
  res.json({ valid: true, discountPercent: code.discountPercent });
});

publicRouter.post('/orders', async (req, res) => {
  try {
    const body = req.body as {
      customerName?: string;
      phone?: string;
      delivery?: string;
      payment?: string;
      items?: { productId: string; colorId: string; sizeStockId: string; sizeLabel: string; quantity: number }[];
      subtotal?: number;
      discount?: number;
      promoCode?: string;
      total?: number;
      comment?: string;
      consentGiven?: boolean;
    };

    if (!body.customerName || !body.phone || !body.delivery || !body.payment) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    if (!body.consentGiven) {
      res.status(400).json({ error: 'consentGiven is required' });
      return;
    }
    if (!body.items?.length) {
      res.status(400).json({ error: 'Order must have at least one item' });
      return;
    }

    const order = await createOrder({
      customerName: body.customerName,
      phone: body.phone,
      delivery: body.delivery,
      payment: body.payment,
      items: body.items,
      subtotal: body.subtotal ?? 0,
      discount: body.discount ?? 0,
      promoCode: body.promoCode,
      total: body.total ?? 0,
      comment: body.comment,
      consentGiven: body.consentGiven,
    });

    res.status(201).json(serializeOrderFull(order));
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      res.status(409).json({ error: 'Insufficient stock', item: err.item });
      return;
    }
    console.error('POST /api/orders failed:', err);
    res.status(400).json({ error: (err as Error).message });
  }
});

publicRouter.get('/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(serializeOrderPublic(order));
});

publicRouter.post('/webhooks/kaspi', async (req, res) => {
  const secret = process.env.KASPI_WEBHOOK_SECRET ?? '';
  const provided = (req.headers['x-kaspi-signature'] as string | undefined) ?? '';
  if (!secret || !safeEqual(provided, secret)) {
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  try {
    const result = await getPaymentProvider().handleWebhook(req.body, provided);
    if (result.status === 'paid') {
      await markOrderPaid(result.orderId, result.transactionId);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Kaspi webhook handling failed:', err);
    res.status(400).json({ error: (err as Error).message });
  }
});

if (isMockPaymentMode()) {
  // Only mounted while PAYMENT_MODE=mock (the default, until Kaspi approves the
  // merchant application) — simulates the bank calling our webhook, going through
  // the exact same handleWebhook/markOrderPaid code a real one would.
  publicRouter.post('/dev/mock-pay/:orderId', async (req, res) => {
    try {
      const result = await getPaymentProvider().handleWebhook({ orderId: req.params.orderId }, undefined);
      const order = await markOrderPaid(result.orderId, result.transactionId);
      res.json(serializeOrderFull(order));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });
}
