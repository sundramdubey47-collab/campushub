-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RentalBookingStatus" ADD VALUE 'PENDING';
ALTER TYPE "RentalBookingStatus" ADD VALUE 'APPROVED';
ALTER TYPE "RentalBookingStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "RentalBooking" ADD COLUMN     "actualStartDate" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';
