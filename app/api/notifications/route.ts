import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ items: [], unseenCount: 0 })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser?.collegeId) return NextResponse.json({ items: [], unseenCount: 0 })

  const lastSeen = dbUser.lastSeenNotificationsAt ?? new Date(0)

  const [notices, events, listings, rentals, notes] = await Promise.all([
    prisma.notice.findMany({
      where: { collegeId: dbUser.collegeId, isArchived: false },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.event.findMany({
      where: { collegeId: dbUser.collegeId },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.listing.findMany({
      where: { collegeId: dbUser.collegeId, status: "AVAILABLE" },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.rentalItem.findMany({
      where: { collegeId: dbUser.collegeId, status: "AVAILABLE" },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.note.findMany({
      where: { university: { colleges: { some: { id: dbUser.collegeId } } } },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
  ])

  const items = [
    ...notices.map((n) => ({ ...n, type: "notice", link: "/notices" })),
    ...events.map((e) => ({ ...e, type: "event", link: "/events" })),
    ...listings.map((l) => ({ ...l, type: "marketplace", link: `/marketplace/${l.id}` })),
    ...rentals.map((r) => ({ ...r, type: "rental", link: "/rentals" })),
    ...notes.map((n) => ({ ...n, type: "resource", link: `/notes/${n.id}` })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15)

  const unseenCount = items.filter((i) => new Date(i.createdAt) > lastSeen).length

  return NextResponse.json({ items, unseenCount })
}