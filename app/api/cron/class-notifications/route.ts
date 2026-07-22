import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPushNotification } from "@/lib/notification-service"
import { nowHHMM, subtractMinutes } from "@/lib/time-utils"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const dayOfWeek = new Date().getDay()
  const currentTime = nowHHMM()
  const tenMinBeforeTarget = subtractMinutes(currentTime, -10) // classes starting in 10 min

  const [upcomingSlots, liveSlots] = await Promise.all([
    prisma.timetableSlot.findMany({ where: { dayOfWeek, startTime: tenMinBeforeTarget } }),
    prisma.timetableSlot.findMany({ where: { dayOfWeek, startTime: currentTime } }),
  ])

  let notified = 0

  for (const slot of [...upcomingSlots.map((s) => ({ slot: s, type: "upcoming" as const })), ...liveSlots.map((s) => ({ slot: s, type: "live" as const }))]) {
    const students = await prisma.user.findMany({
      where: {
        collegeId: slot.slot.collegeId,
        courseId: slot.slot.courseId,
        semesterId: slot.slot.semesterId,
        ...(slot.slot.section ? { OR: [{ section: slot.slot.section }, { section: null }] } : {}),
      },
      select: { id: true },
    })

    for (const student of students) {
      if (slot.type === "upcoming") {
        await sendPushNotification({
          userId: student.id,
          title: "⏰ Class starting in 10 minutes",
          body: `${slot.slot.subjectName} starts at ${slot.slot.startTime}${slot.slot.room ? ` in ${slot.slot.room}` : ""}`,
          url: "/dashboard",
        })
      } else {
        await sendPushNotification({
          userId: student.id,
          title: "🔴 Class is live now",
          body: `${slot.slot.subjectName} has started${slot.slot.room ? ` in ${slot.slot.room}` : ""}. Don't miss it!`,
          url: "/dashboard",
        })
      }
      notified++
    }
  }

  return NextResponse.json({ success: true, notified })
}