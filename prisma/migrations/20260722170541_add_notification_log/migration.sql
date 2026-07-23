-- CreateTable
CREATE TABLE "ClassNotificationLog" (
    "id" SERIAL NOT NULL,
    "timetableSlotId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassNotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassNotificationLog_timetableSlotId_date_type_key" ON "ClassNotificationLog"("timetableSlotId", "date", "type");
