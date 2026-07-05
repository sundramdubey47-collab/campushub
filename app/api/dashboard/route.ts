import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      college: { select: { name: true } },
      _count: { select: { uploadedNotes: true, coupons: true } },
    },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const [recentNotices, upcomingEvents, totalDownloadsReceived] = await Promise.all([
    prisma.notice.findMany({
      where: { collegeId: dbUser.collegeId ?? 0, isArchived: false },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: { id: true, title: true, createdAt: true, isPinned: true },
    }),
    prisma.event.findMany({
      where: { collegeId: dbUser.collegeId ?? 0, eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 3,
      select: { id: true, title: true, eventDate: true },
    }),
    prisma.note.aggregate({
      where: { uploadedById: dbUser.id },
      _sum: { downloads: true },
    }),
  ])

  return NextResponse.json({
    name: dbUser.name,
    role: dbUser.role,
    isPremium: dbUser.isPremium,
    premiumUntil: dbUser.premiumUntil,
    collegeName: dbUser.college?.name ?? null,
    uploadsCount: dbUser._count.uploadedNotes,
    couponsCount: dbUser._count.coupons,
    downloadsReceived: totalDownloadsReceived._sum.downloads ?? 0,
    recentNotices,
    upcomingEvents,
  })
}