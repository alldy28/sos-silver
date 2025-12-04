/*
  Warnings:

  - You are about to drop the column `notes` on the `FactoryPayment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `FactoryPayment` table. All the data in the column will be lost.
  - Added the required column `totalGramasi` to the `FactoryPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FactoryPayment" DROP COLUMN "notes",
DROP COLUMN "totalAmount",
ADD COLUMN     "totalGramasi" DOUBLE PRECISION NOT NULL;
