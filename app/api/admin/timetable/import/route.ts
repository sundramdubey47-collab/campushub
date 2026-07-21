import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendPushNotificationToCollege } from "@/lib/notification-service"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }
  if (!dbUser.collegeId) return NextResponse.json({ error: "College not set" }, { status: 400 })

  const body = await req.json()
  const { courseId, semesterId, rows, fileName } = body

  if (!courseId || !semesterId || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Invalid import request" }, { status: 400 })
  }

  const validRows = rows.filter((r: any) => !r.errors || r.errors.length === 0)

  if (validRows.length === 0) {
    return NextResponse.json({ error: "No valid rows to import" }, { status: 400 })
  }

  // Purane slots isi Course+Semester ke liye replace kar dete hain (naya upload = naya version)
  await prisma.timetableSlot.deleteMany({
    where: { courseId: Number(courseId), semesterId: Number(semesterId), collegeId: dbUser.collegeId },
  })

  await prisma.timetableSlot.createMany({
    data: validRows.map((r: any) => ({
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      subjectName: r.subjectName,
      room: r.room || null,
      facultyName: r.facultyName || null,
      section: r.section || "A",
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      collegeId: dbUser.collegeId,
    })),
  })

  await prisma.timetableVersion.create({
    data: {
      fileName: fileName || "manual-import",
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      collegeId: dbUser.collegeId,
      uploadedById: dbUser.id,
      rowCount: validRows.length,
    },
  })

  await sendPushNotificationToCollege({
    collegeId: dbUser.collegeId,
    title: "📅 Timetable Updated",
    body: `The timetable has been updated. Check your dashboard for the latest schedule.`,
    url: "/timetable",
  })

  return NextResponse.json({ success: true, imported: validRows.length })
}