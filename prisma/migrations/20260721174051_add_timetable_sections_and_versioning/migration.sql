-- AlterTable
ALTER TABLE "TimetableSlot" ADD COLUMN     "section" TEXT DEFAULT 'A';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "section" TEXT;

-- CreateTable
CREATE TABLE "TimetableVersion" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "collegeId" INTEGER NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimetableVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimetableSlot_courseId_semesterId_section_dayOfWeek_idx" ON "TimetableSlot"("courseId", "semesterId", "section", "dayOfWeek");
