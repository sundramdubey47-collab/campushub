/*
  Warnings:

  - You are about to drop the column `isPaid` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[merchantTransactionId]` on the table `EventRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RegistrationPaymentStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "EventPaymentType" AS ENUM ('FREE', 'CASH', 'ONLINE_PHONEPE');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isPaid",
ADD COLUMN     "paymentType" "EventPaymentType" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "merchantTransactionId" TEXT,
ADD COLUMN     "paymentStatus" "RegistrationPaymentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_merchantTransactionId_key" ON "EventRegistration"("merchantTransactionId");
