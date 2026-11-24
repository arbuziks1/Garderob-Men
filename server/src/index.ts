import path from 'node:path';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { requireAdmin } from './middleware/requireAdmin';
import { adminAuthRouter } from './routes/adminAuth';
import { adminBranchesRouter } from './routes/adminBranches';
import { adminMiscRouter } from './routes/adminMisc';
import { adminOrdersRouter } from './routes/adminOrders';
import { adminProductsRouter } from './routes/adminProducts';
import { adminPromoCodesRouter } from './routes/adminPromoCodes';
import { adminSettingsRouter } from './routes/adminSettings';
import { publicBranchesRouter } from './routes/branches';
import { customerRouter } from './routes/customer';
import { publicRouter } from './routes/public';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

const uploadsDir = path.resolve(process.cwd(), process.env.UPLOADS_DIR ?? './uploads');
app.use('/uploads', express.static(uploadsDir));

app.use('/api', publicRouter);
app.use('/api/branches', publicBranchesRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/admin/products', requireAdmin, adminProductsRouter);
app.use('/api/admin/orders', requireAdmin, adminOrdersRouter);
app.use('/api/admin/settings', requireAdmin, adminSettingsRouter);
app.use('/api/admin/promo-codes', requireAdmin, adminPromoCodesRouter);
app.use('/api/admin/branches', requireAdmin, adminBranchesRouter);
app.use('/api/admin', requireAdmin, adminMiscRouter);
app.use('/api/customer', customerRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`GARDEROB MEN API listening on port ${port}`);
});
