import type { Category, Prisma } from '@prisma/client';

const CATEGORY_SKU_CODE: Record<Category, string> = {
  KURTKI_I_PUKHOVIKI: 'JKT',
  PALTO_I_PLASHCHI: 'COT',
  PIDZHAKI_I_KOSTYUMY: 'SUT',
  HUDI_I_TOLSTOVKI: 'HUD',
  SVITSHOTY_I_DZHEMPERY: 'SWT',
  SVITERY_I_KARDIGANY: 'KNT',
  RUBASHKI: 'SHR',
  FUTBOLKI_I_POLO: 'TSH',
  BRYUKI: 'TRS',
  DZHINSY: 'JNS',
  SHORTY: 'SRT',
  OBUV: 'SHO',
  REMNI: 'BLT',
  SUMKI_I_RYUKZAKI: 'BAG',
  GOLOVNYE_UBORY_I_SHARFY: 'HAT',
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
