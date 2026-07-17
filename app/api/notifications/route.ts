import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ items: [], unseenCount: 0 })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser?.collegeId) return NextResponse.json({ items: [], unseenCount: 0 })

  const lastSeen = dbUser.lastSeenNotificationsAt ?? new Date(0)

  const [notices, events, listings, rentals, notes, requests, myFulfilledRequests] = await Promise.all([
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
    prisma.resourceRequest.findMany({
      where: { collegeId: dbUser.collegeId, status: "OPEN", requestedById: { not: dbUser.id } },
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    // Yahi user ki apni requests jo fulfil ho chuki hain — inhe special priority milegi
    prisma.resourceRequest.findMany({
      where: { collegeId: dbUser.collegeId, requestedById: dbUser.id, status: "FULFILLED" },
      orderBy: { fulfilledAt: "desc" }, take: 5,
      select: { id: true, title: true, fulfilledAt: true, fulfilledNoteId: true },
    }),
  ])

  const items = [
    ...notices.map((n) => ({ ...n, type: "notice", link: "/notices" })),
    ...events.map((e) => ({ ...e, type: "event", link: "/events" })),
    ...listings.map((l) => ({ ...l, type: "marketplace", link: `/marketplace/${l.id}` })),
    ...rentals.map((r) => ({ ...r, type: "rental", link: "/rentals" })),
    ...notes.map((n) => ({ ...n, type: "resource", link: `/notes/${n.id}` })),
    ...requests.map((r) => ({ ...r, type: "request", link: "/notes/requests", title: `Someone needs: ${r.title}` })),
    ...myFulfilledRequests.map((r) => ({
      id: r.id,
      title: `Your request "${r.title}" is now available!`,
      createdAt: r.fulfilledAt ?? new Date(),
      type: "fulfilled",
      link: r.fulfilledNoteId ? `/notes/${r.fulfilledNoteId}` : "/notes/requests",
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15)

  const unseenCount = items.filter((i) => new Date(i.createdAt) > lastSeen).length

  return NextResponse.json({ items, unseenCount })
}