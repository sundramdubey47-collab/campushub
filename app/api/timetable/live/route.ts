import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getISTParts, getISTMidnightUTC, normalizeHHMM } from "@/lib/time-utils"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser?.courseId || !dbUser?.semesterId) {
    return NextResponse.json({ current: null, next: null, following: null })
  }

  const { hhmm: currentTime, dayOfWeek } = getISTParts()
  const studentSection = dbUser.section || "A"

  const todaySlots = await prisma.timetableSlot.findMany({
    where: {
      courseId: dbUser.courseId,
      semesterId: dbUser.semesterId,
      dayOfWeek,
      OR: [{ section: studentSection }, { section: null }],
    },
    orderBy: { startTime: "asc" },
  })

  const normalized = todaySlots.map((s) => ({
    ...s,
    startTime: normalizeHHMM(s.startTime),
    endTime: normalizeHHMM(s.endTime),
  }))

  const current = normalized.find((s) => s.startTime <= currentTime && s.endTime > currentTime) ?? null
  const upcoming = normalized.filter((s) => s.startTime > currentTime)
  const next = upcoming[0] ?? null
  const following = upcoming[1] ?? null

  const todayDate = getISTMidnightUTC()
  const relevantSlotIds = [current, next, following].filter(Boolean).map((s) => s!.id)
  const existingAttendance = relevantSlotIds.length
    ? await prisma.attendance.findMany({
        where: { studentId: dbUser.id, timetableSlotId: { in: relevantSlotIds }, date: todayDate },
      })
    : []

  const markedMap: Record<number, string> = {}
  existingAttendance.forEach((a) => { markedMap[a.timetableSlotId] = a.status })

  return NextResponse.json({
    current: current ? { ...current, markedStatus: markedMap[current.id] ?? null } : null,
    next: next ? { ...next, markedStatus: markedMap[next.id] ?? null } : null,
    following: following ? { ...following, markedStatus: markedMap[following.id] ?? null } : null,
    _debug: { currentTime, dayOfWeek },
  })
}