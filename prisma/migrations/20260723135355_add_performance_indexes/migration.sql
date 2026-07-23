-- CreateIndex
CREATE INDEX "Event_collegeId_eventDate_idx" ON "Event"("collegeId", "eventDate");

-- CreateIndex
CREATE INDEX "Listing_collegeId_status_idx" ON "Listing"("collegeId", "status");

-- CreateIndex
CREATE INDEX "Note_universityId_courseId_semesterId_idx" ON "Note"("universityId", "courseId", "semesterId");
