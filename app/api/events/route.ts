
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notifyCollege } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      title,
      description,
      type,
      venue,
      bannerUrl,
      organizerType,
      clubName,
      paymentType,
      feeAmount,
      feeNote,
      eventDate,
      endDate,
      registrationDeadline,
      seatLimit,
    } = body

    // PhonePe online payment validation
    if (
      paymentType === "ONLINE_PHONEPE" &&
      !process.env.PHONEPE_MERCHANT_ID
    ) {
      return NextResponse.json(
        { error: "Online payment is not available yet" },
        { status: 400 }
      )
    }

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: "Title and event date are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { collegeId: true },
    })

    if (!user?.collegeId) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        venue,
        bannerUrl,
        organizerType,
        clubName,
        paymentType,
        feeAmount: feeAmount ? Number(feeAmount) : null,
        feeNote,
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline)
          : null,
        seatLimit: seatLimit ? Number(seatLimit) : null,
        createdById: session.user.id,
        collegeId: user.collegeId,
      },
    })

    // Add creator as organizer
    await prisma.eventTeamMember.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        role: "ORGANIZER",
      },
    })

    // Notify college users
    await notifyCollege({
      collegeId: user.collegeId,
      title: "New Event",
      message: `${event.title} has been created`,
      link: `/events/${event.id}`,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { collegeId: true },
    })

    if (!user?.collegeId) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(req.url)

    const type = searchParams.get("type")
    const upcoming = searchParams.get("upcoming")

    const events = await prisma.event.findMany({
      where: {
        collegeId: user.collegeId,
        ...(type ? { type: type as any } : {}),
        ...(upcoming === "true"
          ? { eventDate: { gte: new Date() } }
          : {}),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            teamMembers: true,
          },
        },
      },
      orderBy: {
        eventDate: "asc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Get events error:", error)

    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}
