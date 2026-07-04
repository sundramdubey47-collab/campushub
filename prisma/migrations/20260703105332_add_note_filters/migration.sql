/*
  Warnings:

  - Added the required column `courseId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `universityId` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoteCategory" AS ENUM ('NOTES', 'ASSIGNMENT', 'LAB_RECORD', 'PREVIOUS_YEAR_PAPER', 'BOOK', 'PRESENTATION', 'PRACTICAL_FILE', 'QUESTION_BANK', 'FACULTY_NOTES');

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "category" "NoteCategory" NOT NULL DEFAULT 'NOTES',
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD COLUMN     "universityId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
