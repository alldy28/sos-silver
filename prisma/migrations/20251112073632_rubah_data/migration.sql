/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `shippingFee` on the `Invoice` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `priceAtTime` on the `InvoiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerId" TEXT,
ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER,
ALTER COLUMN "shippingFee" SET DEFAULT 0,
ALTER COLUMN "shippingFee" SET DATA TYPE INTEGER,
ALTER COLUMN "subTotal" SET DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "priceAtTime" SET DATA TYPE INTEGER,
ALTER COLUMN "gramasi" SET DEFAULT 0;

-- DropEnum
DROP TYPE "public"."InvoiceStatus";

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
