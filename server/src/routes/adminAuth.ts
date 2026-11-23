import bcrypt from 'bcrypt';
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { signAdminToken } from '../lib/jwt';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signAdminToken({ sub: admin.id, email: admin.email });
  res.json({ token });
});
