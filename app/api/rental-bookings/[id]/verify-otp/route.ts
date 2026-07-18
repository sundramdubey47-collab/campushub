import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const { id } = await params
  const body = await req.json()
  const enteredOtp = body.otp

  const booking = await prisma.rentalBooking.findUnique({
    where: { id: Number(id) },
    include: { item: true },
  })

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  if (booking.item.ownerId !== dbUser.id) return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  if (booking.status !== "APPROVED") return NextResponse.json({ error: "Not ready for handover" }, { status: 400 })
  if (booking.otp !== enteredOtp) return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 })

  await prisma.rentalBooking.update({
    where: { id: booking.id },
    data: { status: "ACTIVE", actualStartDate: new Date(), otp: null },
  })

  return NextResponse.json({ success: true })
}