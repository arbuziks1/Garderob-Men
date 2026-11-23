import { seedDatabase } from '../src/lib/seedDatabase';
import { prisma } from '../src/lib/prisma';

// Ports the current demo catalog (SEED_PRODUCTS/DEFAULT_STORE_SETTINGS/DEFAULT_PROMO_CODES
// from src/data/seedData.ts) so a fresh VPS database isn't empty, and creates the first
// admin user from ADMIN_EMAIL/ADMIN_PASSWORD. SEED_ORDERS is deliberately NOT ported:
// those 5 demo orders use the old Russian status strings ('Выдан / Доставлен',
// 'Подтвержден', etc.) which don't map onto the new OrderStatus enum, and seeding fake
// historical orders into a real store's first deployment seemed actively wrong (an
// owner opening /admin on day one shouldn't see 5 orders nobody placed). Run again
// safely at any time — it's the same logic as POST /api/admin/reset-demo-data.
seedDatabase()
  .then(() => {
    console.log('Seed complete.');
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
