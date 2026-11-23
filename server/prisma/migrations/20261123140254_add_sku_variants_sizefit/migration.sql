-- CreateEnum
CREATE TYPE "SizeFit" AS ENUM ('SMALL_FIT', 'TRUE_TO_SIZE', 'BIG_FIT');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "sizeStockId" TEXT,
ADD COLUMN     "skuSnapshot" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sizeFit" "SizeFit",
ADD COLUMN     "sku" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductColor" DROP COLUMN "stockL",
DROP COLUMN "stockM",
DROP COLUMN "stockS",
DROP COLUMN "stockXl",
DROP COLUMN "stockXxl";

-- CreateTable
CREATE TABLE "CategorySkuCounter" (
    "category" "Category" NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CategorySkuCounter_pkey" PRIMARY KEY ("category")
);

-- CreateTable
CREATE TABLE "ProductSizeStock" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "sizeRu" TEXT,
    "sizeEu" TEXT,
    "sizeInt" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSizeStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSizeStock_colorId_idx" ON "ProductSizeStock"("colorId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "ProductSizeStock" ADD CONSTRAINT "ProductSizeStock_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sizeStockId_fkey" FOREIGN KEY ("sizeStockId") REFERENCES "ProductSizeStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

