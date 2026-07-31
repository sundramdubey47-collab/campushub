/*
  Warnings:

  - A unique constraint covering the columns `[date,courseId]` on the table `DailyTrivia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `DailyTrivia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserDevice` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyTrivia_date_key";

-- AlterTable
ALTER TABLE "DailyTrivia" ADD COLUMN     "courseId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserDevice" ADD COLUMN     "platform" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DailyTrivia_date_courseId_key" ON "DailyTrivia"("date", "courseId");

-- AddForeignKey
ALTER TABLE "DailyTrivia" ADD CONSTRAINT "DailyTrivia_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
