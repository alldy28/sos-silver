-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "factoryPaymentId" TEXT;

-- CreateTable
CREATE TABLE "FactoryPayment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "proofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "FactoryPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FactoryPayment_code_key" ON "FactoryPayment"("code");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_factoryPaymentId_fkey" FOREIGN KEY ("factoryPaymentId") REFERENCES "FactoryPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
