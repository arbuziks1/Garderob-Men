-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" JSONB;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "bonusEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bonusPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mapLat" DOUBLE PRECISION,
ADD COLUMN     "mapLng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
