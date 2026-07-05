import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Access denied!" }, { status: 403 })
  }

  const [totalUniversities, totalColleges, totalUsers, totalPremiumUsers, totalNotes, totalEvents, totalListings] =
    await Promise.all([
      prisma.university.count(),
      prisma.college.count(),
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.note.count(),
      prisma.event.count(),
      prisma.listing.count(),
    ])

  return NextResponse.json({
    totalUniversities,
    totalColleges,
    totalUsers,
    totalPremiumUsers,
    totalNotes,
    totalEvents,
    totalListings,
  })
}