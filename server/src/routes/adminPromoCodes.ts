import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const adminPromoCodesRouter = Router();

adminPromoCodesRouter.get('/', async (_req, res) => {
  const codes = await prisma.promoCode.findMany({ orderBy: { code: 'asc' } });
  res.json(codes);
});

adminPromoCodesRouter.post('/', async (req, res) => {
  try {
    const { code, discountPercent, active } = req.body as {
      code?: string;
      discountPercent?: number;
      active?: boolean;
    };
    if (!code || typeof discountPercent !== 'number') {
      res.status(400).json({ error: 'code and discountPercent are required' });
      return;
    }
    const created = await prisma.promoCode.create({
      data: { code: code.toUpperCase(), discountPercent, active: active ?? true },
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

adminPromoCodesRouter.put('/:id', async (req, res) => {
  try {
    const { code, discountPercent, active } = req.body as {
      code?: string;
      discountPercent?: number;
      active?: boolean;
    };
    const updated = await prisma.promoCode.update({
      where: { id: req.params.id },
      data: {
        ...(code !== undefined ? { code: code.toUpperCase() } : {}),
        ...(discountPercent !== undefined ? { discountPercent } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

adminPromoCodesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
