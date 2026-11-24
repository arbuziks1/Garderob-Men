import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const publicBranchesRouter = Router();

// No serializer needed — PickupBranch has no sensitive fields, plain JSON is fine.
publicBranchesRouter.get('/', async (_req, res) => {
  const branches = await prisma.pickupBranch.findMany({ orderBy: { position: 'asc' } });
  res.json(branches);
});
