import bcrypt from 'bcrypt';
import { prisma } from './prisma';
import { LABEL_TO_CATEGORY, LABEL_TO_FIT } from './labels';
import { generateSku } from './sku';
import { DEFAULT_PROMO_CODES, DEFAULT_STORE_SETTINGS, SEED_PRODUCTS } from './seedData';

/** Creates the initial admin user from ADMIN_EMAIL/ADMIN_PASSWORD if one doesn't exist yet.
 *  Safe to call repeatedly — never overwrites an existing admin's password. */
async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin user creation');
    return;
  }
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({ data: { email: normalizedEmail, passwordHash } });
}

/** Resets the catalog, store settings and promo codes to their demo defaults.
 *  Used both by the first-boot seed script and by POST /api/admin/reset-demo-data.
 *
 *  Deleting all products cascades to their colors/images, and sets productId to NULL
 *  on any existing OrderItem rows (onDelete: SetNull) — existing orders keep their
 *  title/color/price snapshot and remain fully readable, they just lose the live
 *  product link. That's an acceptable, documented side effect of a deliberately
 *  destructive "reset demo data" operation. */
async function resetCatalogAndSettings() {
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...DEFAULT_STORE_SETTINGS },
    update: DEFAULT_STORE_SETTINGS,
  });

  for (const promo of DEFAULT_PROMO_CODES) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      create: promo,
      update: { discountPercent: promo.discountPercent, active: promo.active },
    });
  }

  await prisma.product.deleteMany({});
  // Generating the sku requires the CategorySkuCounter upsert to happen inside the same
  // transaction as the product create (see generateSku's docs) — each product gets its
  // own small transaction rather than wrapping the whole seed loop in one, so this never
  // hits Prisma's interactive-transaction timeout on a slow machine.
  for (const product of SEED_PRODUCTS) {
    const category = LABEL_TO_CATEGORY[product.category];
    const fit = LABEL_TO_FIT[product.fit];
    await prisma.$transaction(async (tx) => {
      const sku = await generateSku(tx, category);
      await tx.product.create({
        data: {
          sku,
          title: product.title,
          category,
          fit,
          sizeFit: product.sizeFit ?? null,
          price: product.price,
          oldPrice: product.oldPrice,
          description: product.description,
          modelNote: product.modelNote,
          brand: product.brand,
          countryOfOrigin: product.countryOfOrigin,
          season: product.season,
          material: product.material,
          composition: product.composition,
          characteristics: product.characteristics,
          measurements: product.measurements,
          colors: {
            create: product.colors.map((color, position) => ({
              name: color.name,
              hex: color.hex,
              position,
              images: { create: color.images.map((url, imgPosition) => ({ url, position: imgPosition })) },
              sizes: {
                create: color.sizes.map((s, sizePosition) => ({
                  sizeRu: s.sizeRu ?? null,
                  sizeEu: s.sizeEu ?? null,
                  sizeInt: s.sizeInt ?? null,
                  stock: s.stock,
                  position: sizePosition,
                })),
              },
            })),
          },
        },
      });
    });
  }
}

export async function seedDatabase() {
  await ensureAdminUser();
  await resetCatalogAndSettings();
}
