import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getISTParts, getISTMidnightUTC, normalizeHHMM } from "@/lib/time-utils"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const body = await req.json()
  const { timetableSlotId, status } = body

  if (!timetableSlotId || !["PRESENT", "ABSENT", "NOT_CONDUCTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const slot = await prisma.timetableSlot.findUnique({ where: { id: Number(timetableSlotId) } })
  if (!slot) return NextResponse.json({ error: "Class slot not found" }, { status: 404 })

  const { hhmm: currentTime, dayOfWeek } = getISTParts()
  const slotStart = normalizeHHMM(slot.startTime)
  if (slot.dayOfWeek === dayOfWeek && slotStart > currentTime) {
    return NextResponse.json({ error: "This class hasn't started yet" }, { status: 400 })
  }

  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_timetableSlotId_date: {
        studentId: dbUser.id,
        timetableSlotId: Number(timetableSlotId),
        date: getISTMidnightUTC(),
      },
    },
    update: { status },
    create: {
      studentId: dbUser.id,
      timetableSlotId: Number(timetableSlotId),
      date: getISTMidnightUTC(),
      status,
    },
  })

  return NextResponse.json(attendance)
}