-- AlterTable
ALTER TABLE "CampusChatMessage" ADD COLUMN     "replyToId" INTEGER;

-- AddForeignKey
ALTER TABLE "CampusChatMessage" ADD CONSTRAINT "CampusChatMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "CampusChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
