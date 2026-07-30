/*
  Warnings:

  - You are about to drop the column `deviceName` on the `UserDevice` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `UserDevice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserDevice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserDevice" DROP CONSTRAINT "UserDevice_userId_fkey";

-- AlterTable
ALTER TABLE "UserDevice" DROP COLUMN "deviceName",
DROP COLUMN "platform",
DROP COLUMN "updatedAt";

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
