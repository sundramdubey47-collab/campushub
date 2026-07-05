import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const LATE_FEE_PER_DAY = 20 // ₹20 per din late hone par

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const { id } = await params

  const booking = await prisma.rentalBooking.findUnique({
    where: { id: Number(id) },
    include: { item: true },
  })

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  if (booking.renterId !== dbUser.id && booking.item.ownerId !== dbUser.id) {
    return NextResponse.json({ error: "Access denied!" }, { status: 403 })
  }

  if (booking.status === "RETURNED") {
    return NextResponse.json({ error: "This item has been alredy returned" }, { status: 400 })
  }

  const now = new Date()
  const expectedReturn = new Date(booking.expectedReturnDate)

  let lateFee = 0
  if (now > expectedReturn) {
    const daysLate = Math.ceil((now.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24))
    lateFee = daysLate * LATE_FEE_PER_DAY
  }

  await prisma.rentalBooking.update({
    where: { id: booking.id },
    data: {
      status: "RETURNED",
      actualReturnDate: now,
      lateFee,
    },
  })

  await prisma.rentalItem.update({
    where: { id: booking.itemId },
    data: { status: "AVAILABLE" },
  })

  return NextResponse.json({ success: true, lateFee })
}