import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const adminSettingsRouter = Router();

adminSettingsRouter.get('/', async (_req, res) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    res.status(500).json({ error: 'Store settings have not been seeded' });
    return;
  }
  res.json(settings);
});

adminSettingsRouter.put('/', async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    // id is fixed at 1 (single-row table) and must never come from the request body.
    const { id, ...data } = body;
    void id;
    const settings = await prisma.storeSettings.update({ where: { id: 1 }, data });
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
