-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "characteristics" JSONB,
ADD COLUMN     "composition" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "season" TEXT;
