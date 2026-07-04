import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Sirf Faculty/Admin event bana sakte hain" }, { status: 403 })
  }

  if (!dbUser.collegeId) {
    return NextResponse.json({ error: "Aapki college set nahi hai" }, { status: 400 })
  }

  const body = await req.json()
  const { title, description, type, venue, bannerUrl, eventDate, registrationDeadline, seatLimit } = body

  if (!title || !eventDate) {
    return NextResponse.json({ error: "Title aur Event Date zaroori hai" }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      type: type || "OTHER",
      venue,
      bannerUrl,
      eventDate: new Date(eventDate),
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      seatLimit: seatLimit ? Number(seatLimit) : null,
      createdById: dbUser.id,
      collegeId: dbUser.collegeId,
    },
  })

  return NextResponse.json(event)
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const events = await prisma.event.findMany({
    where: { collegeId: dbUser.collegeId },
    orderBy: { eventDate: "asc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
  })

  return NextResponse.json(events)
}