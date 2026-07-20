import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendPushNotification } from "@/lib/notification-service"

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
  const action = body.action

  const booking = await prisma.rentalBooking.findUnique({
    where: { id: Number(id) },
    include: { item: true },
  })

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  if (booking.item.ownerId !== dbUser.id) return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  if (booking.status !== "PENDING") return NextResponse.json({ error: "Already handled" }, { status: 400 })

  if (action === "approve") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: { status: "APPROVED", otp },
    })
    await prisma.rentalItem.update({
      where: { id: booking.itemId },
      data: { status: "RENTED" },
    })
await sendPushNotification({
  userId: booking.renterId,
  title: "✅ Rental Request Approved",
  body: `Your request for "${booking.item.title}" has been approved.`,
  url: "/rentals/my-bookings",
})
    
  } else {
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: { status: "REJECTED" },
    })

    await sendPushNotification({
  userId: booking.renterId,
  title: "❌ Rental Request Rejected",
  body: `Your request for "${booking.item.title}" was rejected.`,
  url: "/rentals/my-bookings",
})
  }

  return NextResponse.json({ success: true })
}