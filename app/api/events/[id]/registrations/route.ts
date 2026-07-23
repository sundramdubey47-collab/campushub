import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function checkOrganizerAccess(eventId: number, userId: number) {
  const membership = await prisma.eventTeamMember.findUnique({
    where: { eventId_userId: { eventId, userId } },
  })
  return membership?.role === "ORGANIZER"
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const eventId = Number(id)

  const isOrganizer = await checkOrganizerAccess(eventId, dbUser.id)
  const isCollegeAdmin = ["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)

  if (!isOrganizer && !isCollegeAdmin) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId },
    orderBy: { registeredAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  })

  const totalRegistered = registrations.length
  const totalCheckedIn = registrations.filter((r) => r.attended).length
  const estimatedRevenue = event.isPaid && event.feeAmount ? event.feeAmount * totalRegistered : 0

  return NextResponse.json({
    registrations,
    stats: { totalRegistered, totalCheckedIn, estimatedRevenue },
    event: { title: event.title, isPaid: event.isPaid, feeAmount: event.feeAmount },
  })
}