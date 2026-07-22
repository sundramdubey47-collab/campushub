import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { nowHHMM } from "@/lib/time-utils"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser?.courseId || !dbUser?.semesterId) {
    return NextResponse.json({ current: null, next: null, following: null })
  }

  const dayOfWeek = new Date().getDay()
  const currentTime = nowHHMM()
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

  const current = todaySlots.find((s) => s.startTime <= currentTime && s.endTime > currentTime) ?? null
  const upcoming = todaySlots.filter((s) => s.startTime > currentTime)
  const next = upcoming[0] ?? null
  const following = upcoming[1] ?? null

  // Aaj ki date, attendance already mark hui hai ya nahi check karo
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

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
  })
}