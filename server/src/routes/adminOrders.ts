import { Router } from 'express';
import type { OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { serializeOrderFull } from '../lib/serializers';
import { transitionOrderStatus } from '../services/orderLifecycle';

export const adminOrdersRouter = Router();

const VALID_STATUSES: OrderStatus[] = ['PENDING_PAYMENT', 'PAID', 'CANCELLED', 'SHIPPED', 'DELIVERED'];

adminOrdersRouter.get('/', async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders.map(serializeOrderFull));
});

adminOrdersRouter.patch('/:id/status', async (req, res) => {
  const { status } = req.body as { status?: string };
  if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
    res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
    return;
  }

  const order = await transitionOrderStatus(req.params.id, status as OrderStatus);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(serializeOrderFull(order));
});
