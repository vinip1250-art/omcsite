-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "month" TEXT,
ADD COLUMN     "serialNumber" TEXT;

-- CreateIndex
CREATE INDEX "Purchase_productId_idx" ON "Purchase"("productId");
