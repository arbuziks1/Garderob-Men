-- This migration is not safely additive: PaymentMethod's enum values change
-- (KASPI_QR/TRANSFER/CASH -> CASH_ON_PICKUP/CARD_ONLINE) and ProductSizeStock.stock
-- is replaced by per-branch BranchStock rows. Since this is dev/demo data, the
-- existing Order/OrderItem rows (whichever payment-method values they hold) are
-- cleared first rather than data-migrated — historical demo orders referencing
-- removed enum values can't just be converted onto the new two-value enum.
DELETE FROM "OrderItem";
DELETE FROM "Order";

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH_ON_PICKUP', 'CARD_ONLINE');
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pickupBranchId" TEXT,
ADD COLUMN     "pickupBranchNameSnapshot" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "branchStockId" TEXT;

-- AlterTable
ALTER TABLE "ProductSizeStock" DROP COLUMN "stock";

-- AlterTable
ALTER TABLE "StoreSettings" DROP COLUMN "address",
DROP COLUMN "mapLat",
DROP COLUMN "mapLng",
DROP COLUMN "twoGisUrl",
DROP COLUMN "workingHours";

-- CreateTable
CREATE TABLE "PickupBranch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "workingHours" JSONB NOT NULL,
    "phone" TEXT NOT NULL,
    "twoGisUrl" TEXT,
    "mapLat" DOUBLE PRECISION,
    "mapLng" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PickupBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchStock" (
    "id" TEXT NOT NULL,
    "sizeStockId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BranchStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BranchStock_branchId_idx" ON "BranchStock"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchStock_sizeStockId_branchId_key" ON "BranchStock"("sizeStockId", "branchId");

-- AddForeignKey
ALTER TABLE "BranchStock" ADD CONSTRAINT "BranchStock_sizeStockId_fkey" FOREIGN KEY ("sizeStockId") REFERENCES "ProductSizeStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStock" ADD CONSTRAINT "BranchStock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "PickupBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pickupBranchId_fkey" FOREIGN KEY ("pickupBranchId") REFERENCES "PickupBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_branchStockId_fkey" FOREIGN KEY ("branchStockId") REFERENCES "BranchStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
