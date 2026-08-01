import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notifyCollege } from "@/lib/notify"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  if (!dbUser.collegeId) {
    return NextResponse.json(
      { error: "Your college is not set" },
      { status: 400 }
    )
  }

  const body = await req.json()

  const {
    title,
    description,
    type,
    venue,
    bannerUrl,
    eventDate,
    endDate,
    registrationDeadline,
    seatLimit,
    organizerType,
    clubName,
    paymentType,
    feeAmount,
    feeNote,
  } = body

  if (!title || !eventDate) {
    return NextResponse.json(
      { error: "Title and Event Date are required" },
      { status: 400 }
    )
  }

  const isCollegeEvent = organizerType === "COLLEGE"

  // Sirf Faculty/Admin official college event bana sakte hain
  if (
    isCollegeEvent &&
    !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)
  ) {
    return NextResponse.json(
      { error: "Only Faculty/Admin can create official college events" },
      { status: 403 }
    )
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      type: type || "OTHER",
      venue,
      bannerUrl,

      organizerType: organizerType || "COLLEGE",
      clubName: clubName || null,

      paymentType: paymentType || "FREE",
      feeAmount:
        paymentType === "FREE"
          ? null
          : feeAmount
          ? Number(feeAmount)
          : null,
      feeNote: feeNote || null,

      eventDate: new Date(eventDate),
      endDate: endDate ? new Date(endDate) : null,
      registrationDeadline: registrationDeadline
        ? new Date(registrationDeadline)
        : null,
      seatLimit: seatLimit ? Number(seatLimit) : null,

      createdById: dbUser.id,
      collegeId: dbUser.collegeId,
    },
  })

  // Event creator automatically organizer banega
  await prisma.eventTeamMember.create({
    data: {
      eventId: event.id,
      userId: dbUser.id,
      role: "ORGANIZER",
    },
  })
await notifyCollege({
  collegeId: dbUser.collegeId,
  type: "EVENT",
  title: "🎉 New Event Posted",
  body: title,
  link: "/events",
  excludeUserId: dbUser.id,
})
  return NextResponse.json(event)
}

export async function GET() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
  })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const events = await prisma.event.findMany({
    where: {
      collegeId: dbUser.collegeId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
  })

  return NextResponse.json(events)
}