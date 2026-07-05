import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import QRCode from "qrcode"
import crypto from "crypto"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  const { id } = await params
  const eventId = Number(id)

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  })

  if (!event) {
    return NextResponse.json({ error: "Event not Found" }, { status: 404 })
  }

  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return NextResponse.json({ error: "Oops! Registration already closed" }, { status: 400 })
  }

  if (event.seatLimit && event._count.registrations >= event.seatLimit) {
    return NextResponse.json({ error: "Try next time, All seats are full" }, { status: 400 })
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: dbUser.id, eventId } },
  })

  if (existing) {
    return NextResponse.json({ error: "you are alredy register" }, { status: 400 })
  }

  const qrCode = crypto.randomBytes(16).toString("hex")

  const registration = await prisma.eventRegistration.create({
    data: { userId: dbUser.id, eventId, qrCode },
  })

  const qrImageDataUrl = await QRCode.toDataURL(qrCode)

  return NextResponse.json({ registration, qrImage: qrImageDataUrl })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ registered: false })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) {
    return NextResponse.json({ registered: false })
  }

  const { id } = await params

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: dbUser.id, eventId: Number(id) } },
  })

  if (!existing) {
    return NextResponse.json({ registered: false })
  }

  const qrImageDataUrl = await QRCode.toDataURL(existing.qrCode)
  return NextResponse.json({ registered: true, qrImage: qrImageDataUrl })
}