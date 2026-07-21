import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Events jinki end date (ya start date agar end date na ho) 1 din pehle nikal chuki hai
  const deletedEvents = await prisma.event.deleteMany({
    where: {
      OR: [
        { endDate: { lt: oneDayAgo } },
        { AND: [{ endDate: null }, { eventDate: { lt: oneDayAgo } }] },
      ],
    },
  })

  // Notices jo manually archive ho chuki hain, ya 30 din se purani hain aur pinned nahi hain
  const deletedNotices = await prisma.notice.deleteMany({
    where: {
      OR: [
        { isArchived: true },
        { AND: [{ isPinned: false }, { createdAt: { lt: thirtyDaysAgo } }] },
      ],
    },
  })

  return NextResponse.json({
    success: true,
    deletedEvents: deletedEvents.count,
    deletedNotices: deletedNotices.count,
  })
}