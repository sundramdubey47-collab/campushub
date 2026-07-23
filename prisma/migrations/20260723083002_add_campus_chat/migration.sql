-- CreateTable
CREATE TABLE "CampusChatMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "collegeId" INTEGER NOT NULL,

    CONSTRAINT "CampusChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampusChatMessage_collegeId_createdAt_idx" ON "CampusChatMessage"("collegeId", "createdAt");

-- AddForeignKey
ALTER TABLE "CampusChatMessage" ADD CONSTRAINT "CampusChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampusChatMessage" ADD CONSTRAINT "CampusChatMessage_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
