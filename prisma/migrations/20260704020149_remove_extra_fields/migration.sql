/*
  Warnings:

  - You are about to drop the column `language` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `noteType` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Note` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NoteCategory" ADD VALUE 'VIVA_QUESTIONS';
ALTER TYPE "NoteCategory" ADD VALUE 'PROJECT';
ALTER TYPE "NoteCategory" ADD VALUE 'OTHERS';

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "language",
DROP COLUMN "noteType",
DROP COLUMN "year";

-- DropEnum
DROP TYPE "NoteType";
