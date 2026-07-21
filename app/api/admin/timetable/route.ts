import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }
  if (!dbUser.collegeId) return NextResponse.json({ error: "College not set" }, { status: 400 })

  const body = await req.json()
  const { dayOfWeek, startTime, endTime, subjectName, room, facultyName, courseId, semesterId } = body

  if (dayOfWeek === undefined || !startTime || !endTime || !subjectName || !courseId || !semesterId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const slot = await prisma.timetableSlot.create({
    data: {
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      subjectName,
      room: room || null,
      facultyName: facultyName || null,
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      collegeId: dbUser.collegeId,
    },
  })

  return NextResponse.json(slot)
}

export async function GET(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser?.collegeId) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get("courseId")
  const semesterId = searchParams.get("semesterId")

  if (!courseId || !semesterId) return NextResponse.json([])

  const slots = await prisma.timetableSlot.findMany({
    where: { courseId: Number(courseId), semesterId: Number(semesterId), collegeId: dbUser.collegeId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })

  return NextResponse.json(slots)
}