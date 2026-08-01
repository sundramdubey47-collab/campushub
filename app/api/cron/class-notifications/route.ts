import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notifyUser } from "@/lib/notify"
import { getISTParts, getISTMidnightUTC, minutesBetween, normalizeHHMM } from "@/lib/time-utils"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedHeader) {
    console.error("[Cron Auth Failed] Received:", authHeader?.slice(0, 15), "Expected prefix:", expectedHeader.slice(0, 15))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ...baaki function same rahega
  const { hhmm: currentTime, dayOfWeek } = getISTParts()
  const today = getISTMidnightUTC()

  const todaySlots = await prisma.timetableSlot.findMany({ where: { dayOfWeek } })

  let notified = 0

  for (const slot of todaySlots) {
    const slotStart = normalizeHHMM(slot.startTime)
    const slotEnd = normalizeHHMM(slot.endTime)
    const minsToStart = minutesBetween(currentTime, slotStart)
    const isUpcoming = minsToStart > 0 && minsToStart <= 10
    const isLive = slotStart <= currentTime && slotEnd > currentTime

    if (!isUpcoming && !isLive) continue

    const notifType = isLive ? "LIVE" : "UPCOMING"

    try {
      await prisma.classNotificationLog.create({
        data: { timetableSlotId: slot.id, date: today, type: notifType },
      })
    } catch {
      continue
    }

    const students = await prisma.user.findMany({
      where: {
        collegeId: slot.collegeId,
        courseId: slot.courseId,
        semesterId: slot.semesterId,
        OR: [{ section: slot.section }, { section: null }],
      },
      select: { id: true },
    })

    for (const student of students) {
      await notifyUser({
        userId: student.id,
        type: notifType === "UPCOMING" ? "CLASS_UPCOMING" : "CLASS_LIVE",
        title: notifType === "UPCOMING" ? "⏰ Class starting in 10 minutes" : "🔴 Class is live now",
        body: notifType === "UPCOMING"
          ? `${slot.subjectName} starts at ${slotStart}${slot.room ? ` in ${slot.room}` : ""}`
          : `${slot.subjectName} has started${slot.room ? ` in ${slot.room}` : ""}. Don't miss it!`,
        link: "/dashboard",
      })
      notified++
    }
  }

  return NextResponse.json({ success: true, notified })
}