/*
  Warnings:

  - You are about to drop the column `month` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `Purchase` table. All the data in the column will be lost.
  - The `status` column on the `Purchase` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `averageStockCost` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `averageUnitCost` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `totalInStock` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonthlyReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointsAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointsProgram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Made the column `clubAndStore` on table `Purchase` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PointsAccount" DROP CONSTRAINT "PointsAccount_programId_fkey";

-- DropForeignKey
ALTER TABLE "PointsProgram" DROP CONSTRAINT "PointsProgram_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_productId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productId_fkey";

-- DropIndex
DROP INDEX "Product_model_storage_color_idx";

-- DropIndex
DROP INDEX "Product_name_key";

-- DropIndex
DROP INDEX "Purchase_account_idx";

-- DropIndex
DROP INDEX "Purchase_month_idx";

-- DropIndex
DROP INDEX "Stock_productId_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "month",
DROP COLUMN "serialNumber",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "points" SET DEFAULT 0,
ALTER COLUMN "points" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "thousand" SET DEFAULT 0,
ALTER COLUMN "thousand" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "clubAndStore" SET NOT NULL,
ALTER COLUMN "pointsPerReal" SET DEFAULT 0,
ALTER COLUMN "pointsPerReal" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "averageStockCost",
DROP COLUMN "averageUnitCost",
DROP COLUMN "totalInStock",
ADD COLUMN     "averageCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "MonthlyReport";

-- DropTable
DROP TABLE "PointsAccount";

-- DropTable
DROP TABLE "PointsProgram";

-- DropTable
DROP TABLE "Store";

-- DropEnum
DROP TYPE "PurchaseStatus";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Product_userId_idx" ON "Product"("userId");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "Stock_userId_idx" ON "Stock"("userId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
