-- This migration is not safely additive: the Category enum's 5 broad buckets are
-- replaced with 15 specific clothing-type values, and neither existing Product rows
-- nor existing CategorySkuCounter rows (both of which reference the old enum values)
-- can be remapped onto the new, more granular set automatically. Since this is
-- dev/demo data, clear both first rather than data-migrate them — a fresh product in
-- each new category correctly starts its SKU sequence at 0001. Existing OrderItem rows
-- are unaffected: OrderItem.productId is already nullable with onDelete: SetNull, so
-- deleting Product rows only nulls out that link (cascades to ProductColor/
-- ProductImage/ProductSizeStock/BranchStock), and Order/OrderItem themselves are left
-- alone.
DELETE FROM "Product";
DELETE FROM "CategorySkuCounter";

-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('KURTKI_I_PUKHOVIKI', 'PALTO_I_PLASHCHI', 'PIDZHAKI_I_KOSTYUMY', 'HUDI_I_TOLSTOVKI', 'SVITSHOTY_I_DZHEMPERY', 'SVITERY_I_KARDIGANY', 'RUBASHKI', 'FUTBOLKI_I_POLO', 'BRYUKI', 'DZHINSY', 'SHORTY', 'OBUV', 'REMNI', 'SUMKI_I_RYUKZAKI', 'GOLOVNYE_UBORY_I_SHARFY');
ALTER TABLE "CategorySkuCounter" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;
