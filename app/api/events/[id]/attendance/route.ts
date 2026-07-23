import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Login karna zaroori hai" },
      { status: 401 }
    )
  }

  // ✅ id pehle nikaalo
  const { id } = await params

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser) {
    return NextResponse.json(
      { error: "Login is required" },
      { status: 401 }
    )
  }

  const isCollegeStaff = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(
    dbUser.role
  )

  const teamMembership = await prisma.eventTeamMember.findUnique({
    where: {
      eventId_userId: {
        eventId: Number(id),
        userId: dbUser.id,
      },
    },
  })

  if (!isCollegeStaff && !teamMembership) {
    return NextResponse.json(
      { error: "You don't have permission to scan for this event" },
      { status: 403 }
    )
  }

  const body = await req.json()
  const qrCode = body.qrCode

  const registration = await prisma.eventRegistration.findFirst({
    where: {
      qrCode,
      eventId: Number(id),
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!registration) {
    return NextResponse.json(
      { error: "Invalid QR code" },
      { status: 404 }
    )
  }

  if (registration.attended) {
    return NextResponse.json(
      { error: `${registration.user.name} Attendance has alredy been taken` },
      { status: 400 }
    )
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { attended: true },
  })

  return NextResponse.json({
    success: true,
    name: registration.user.name,
  })
}