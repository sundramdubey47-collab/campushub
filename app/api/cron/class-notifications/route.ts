import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPushNotification } from "@/lib/notification-service"
import { getISTParts, getISTMidnightUTC, minutesBetween, normalizeHHMM } from "@/lib/time-utils"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { hhmm: currentTime, dayOfWeek } = getISTParts()
  const today = getISTMidnightUTC()

  const todaySlots = await prisma.timetableSlot.findMany({ where: { dayOfWeek } })

  let notified = 0
  const checked: any[] = []

  for (const slot of todaySlots) {
    const slotStart = normalizeHHMM(slot.startTime)
    const slotEnd = normalizeHHMM(slot.endTime)
    const minsToStart = minutesBetween(currentTime, slotStart)
    const isUpcoming = minsToStart > 0 && minsToStart <= 10
    const isLive = slotStart <= currentTime && slotEnd > currentTime

    checked.push({ subject: slot.subjectName, slotStart, minsToStart, isUpcoming, isLive })

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
      await sendPushNotification({
        userId: student.id,
        title: notifType === "UPCOMING" ? "⏰ Class starting in 10 minutes" : "🔴 Class is live now",
        body: notifType === "UPCOMING"
          ? `${slot.subjectName} starts at ${slotStart}${slot.room ? ` in ${slot.room}` : ""}`
          : `${slot.subjectName} has started${slot.room ? ` in ${slot.room}` : ""}. Don't miss it!`,
        url: "/dashboard",
      })
      notified++
    }
  }

  return NextResponse.json({ success: true, notified, currentTime, dayOfWeek, checked })
}