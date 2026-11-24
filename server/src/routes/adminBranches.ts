import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const adminBranchesRouter = Router();

interface BranchInput {
  name?: string;
  address?: string;
  workingHours?: unknown;
  phone?: string;
  twoGisUrl?: string;
  mapLat?: number;
  mapLng?: number;
}

adminBranchesRouter.get('/', async (_req, res) => {
  try {
    const branches = await prisma.pickupBranch.findMany({ orderBy: { position: 'asc' } });
    res.json(branches);
  } catch (err) {
    console.error('GET /api/admin/branches failed:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

adminBranchesRouter.post('/', async (req, res) => {
  try {
    const body = req.body as BranchInput;
    if (!body.name || !body.address || !body.workingHours || !body.phone) {
      res.status(400).json({ error: 'name, address, workingHours and phone are required' });
      return;
    }
    const position = await prisma.pickupBranch.count();
    const created = await prisma.pickupBranch.create({
      data: {
        name: body.name,
        address: body.address,
        workingHours: body.workingHours as object,
        phone: body.phone,
        twoGisUrl: body.twoGisUrl,
        mapLat: body.mapLat,
        mapLng: body.mapLng,
        position,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

adminBranchesRouter.put('/:id', async (req, res) => {
  try {
    const body = req.body as BranchInput;
    const updated = await prisma.pickupBranch.update({
      where: { id: req.params.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.workingHours !== undefined ? { workingHours: body.workingHours as object } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.twoGisUrl !== undefined ? { twoGisUrl: body.twoGisUrl } : {}),
        ...(body.mapLat !== undefined ? { mapLat: body.mapLat } : {}),
        ...(body.mapLng !== undefined ? { mapLng: body.mapLng } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

// Body: { ids: string[] } — the full ordered list of branch ids. Sets each one's
// position to its index in that array, so the admin UI can let the owner reorder
// branches (a separate task builds that UI).
adminBranchesRouter.patch('/reorder', async (req, res) => {
  try {
    const { ids } = req.body as { ids?: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids must be a non-empty array of branch ids' });
      return;
    }
    await prisma.$transaction(
      ids.map((id, position) => prisma.pickupBranch.update({ where: { id }, data: { position } }))
    );
    const branches = await prisma.pickupBranch.findMany({ orderBy: { position: 'asc' } });
    res.json(branches);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Deleting a branch cascades to its BranchStock rows (a branch that's gone shouldn't
// still claim it has stock). Order.pickupBranchId is already nullable with
// onDelete: SetNull, so historical orders keep their pickupBranchNameSnapshot even
// after the branch is deleted — no extra guard needed beyond what the schema does.
adminBranchesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.pickupBranch.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});
