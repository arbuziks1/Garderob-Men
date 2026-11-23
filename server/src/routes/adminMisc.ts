import { Router } from 'express';
import { seedDatabase } from '../lib/seedDatabase';

export const adminMiscRouter = Router();

// Resets the catalog/settings/promo-codes to demo defaults. Does NOT touch orders or
// the admin user. Intended for demoing/resetting a staging deployment, not for
// production use once real orders exist (see seedDatabase.ts for the exact effect
// on existing orders' productId references).
adminMiscRouter.post('/reset-demo-data', async (_req, res) => {
  try {
    await seedDatabase();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
