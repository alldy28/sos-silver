/*
  Warnings:

  - You are about to drop the column `customerId` on the `Invoice` table. All the data in the column will be lost.
  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PAID', 'WAITING_VERIFICATION', 'SEDANG_DISIAPKAN', 'SEDANG_PENGIRIMAN', 'SELESAI', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."Invoice" DROP CONSTRAINT "Invoice_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invoice" DROP CONSTRAINT "Invoice_customerId_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "customerId",
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "shippingFee" SET DEFAULT 0,
ALTER COLUMN "shippingFee" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "subTotal" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "InvoiceItem" ALTER COLUMN "priceAtTime" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "gramasi" DROP DEFAULT;
