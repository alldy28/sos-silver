-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordLastAttempt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;
