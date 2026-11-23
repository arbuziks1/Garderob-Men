import type { Category, Prisma } from '@prisma/client';

const CATEGORY_SKU_CODE: Record<Category, string> = {
  VERKHNYAYA_ODEZHDA: 'OUT',
  HUDI_I_SVITSHOTY: 'KNIT',
  BRYUKI_I_DZHINSY: 'PNT',
  KOSTYUMY_I_RUBASHKI: 'SUIT',
  OBUV_I_AKSESSUARY: 'SHOE',
};

/** Generates the next sequential SKU for a category, e.g. GM-OUT-0014. Must run inside
 *  the same transaction as the product create it belongs to, so two concurrent admin
 *  creates in the same category can never collide (the counter row's update takes a
 *  row lock for the duration of the transaction). */
export async function generateSku(
  tx: Prisma.TransactionClient,
  category: Category
): Promise<string> {
  const counter = await tx.categorySkuCounter.upsert({
    where: { category },
    create: { category, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  const code = CATEGORY_SKU_CODE[category];
  return `GM-${code}-${String(counter.lastNumber).padStart(4, '0')}`;
}
