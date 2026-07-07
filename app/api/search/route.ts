import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ notes: [], events: [], listings: [], notices: [], rentals: [], tests: [] })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser?.collegeId) return NextResponse.json({ notes: [], events: [], listings: [], notices: [], rentals: [], tests: [] })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) return NextResponse.json({ notes: [], events: [], listings: [], notices: [], rentals: [], tests: [] })

  const [notes, events, listings, notices, rentals, tests] = await Promise.all([
    prisma.note.findMany({
      where: {
        university: { colleges: { some: { id: dbUser.collegeId } } },
        OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }],
      },
      take: 5, select: { id: true, title: true },
    }),
    prisma.event.findMany({
      where: { collegeId: dbUser.collegeId, title: { contains: q, mode: "insensitive" } },
      take: 5, select: { id: true, title: true },
    }),
    prisma.listing.findMany({
      where: { collegeId: dbUser.collegeId, title: { contains: q, mode: "insensitive" }, status: "AVAILABLE" },
      take: 5, select: { id: true, title: true },
    }),
    prisma.notice.findMany({
      where: { collegeId: dbUser.collegeId, title: { contains: q, mode: "insensitive" }, isArchived: false },
      take: 5, select: { id: true, title: true },
    }),
    prisma.rentalItem.findMany({
      where: { collegeId: dbUser.collegeId, title: { contains: q, mode: "insensitive" }, status: "AVAILABLE" },
      take: 5, select: { id: true, title: true },
    }),
    prisma.test.findMany({
      where: { collegeId: dbUser.collegeId, title: { contains: q, mode: "insensitive" } },
      take: 5, select: { id: true, title: true },
    }),
  ])

  return NextResponse.json({ notes, events, listings, notices, rentals, tests })
}