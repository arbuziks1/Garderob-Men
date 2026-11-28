-- The Fit enum used to describe silhouette tightness (Oversize/Regular/Slim), which
-- duplicated the per-category "Силуэт" characteristic (Прямой/Приталенный/Oversize) on
-- every outerwear/knit product. Repurposing Fit to describe garment length instead
-- (До талии/До бедра/Ниже бедра) removes that duplication, but existing Product rows'
-- old Fit values have no sensible 1:1 mapping onto the new ones. Since this is dev/demo
-- data, clear Product first rather than data-migrate it — the updated seed re-populates
-- every product with a length value chosen per garment. Existing OrderItem rows are
-- unaffected: OrderItem.productId is already nullable with onDelete: SetNull, so
-- deleting Product rows only nulls out that link (cascades to ProductColor/
-- ProductImage/ProductSizeStock/BranchStock), and Order/OrderItem themselves are left
-- alone.
DELETE FROM "Product";

-- AlterEnum
BEGIN;
CREATE TYPE "Fit_new" AS ENUM ('TO_WAIST', 'TO_HIP', 'BELOW_HIP');
ALTER TABLE "Product" ALTER COLUMN "fit" TYPE "Fit_new" USING ("fit"::text::"Fit_new");
ALTER TYPE "Fit" RENAME TO "Fit_old";
ALTER TYPE "Fit_new" RENAME TO "Fit";
DROP TYPE "public"."Fit_old";
COMMIT;
