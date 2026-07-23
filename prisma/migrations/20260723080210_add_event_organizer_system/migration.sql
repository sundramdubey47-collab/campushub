-- CreateEnum
CREATE TYPE "EventOrganizerType" AS ENUM ('COLLEGE', 'CLUB');

-- CreateEnum
CREATE TYPE "EventTeamRole" AS ENUM ('ORGANIZER', 'VOLUNTEER');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "clubName" TEXT,
ADD COLUMN     "feeAmount" INTEGER,
ADD COLUMN     "feeNote" TEXT,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizerType" "EventOrganizerType" NOT NULL DEFAULT 'COLLEGE';

-- CreateTable
CREATE TABLE "EventTeamMember" (
    "id" SERIAL NOT NULL,
    "role" "EventTeamRole" NOT NULL DEFAULT 'VOLUNTEER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EventTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventTeamMember_eventId_userId_key" ON "EventTeamMember"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventTeamMember" ADD CONSTRAINT "EventTeamMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTeamMember" ADD CONSTRAINT "EventTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
