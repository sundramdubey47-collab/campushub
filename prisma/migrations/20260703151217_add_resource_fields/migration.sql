-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('HANDWRITTEN', 'TYPED', 'PRINTED');

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "language" TEXT DEFAULT 'English',
ADD COLUMN     "noteType" "NoteType",
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "year" INTEGER;
