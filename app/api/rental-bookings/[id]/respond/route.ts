import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notifyUser } from "@/lib/notify"

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
await notifyUser({
  userId: booking.renterId,
  type: "RENTAL_APPROVED",
  title: "✅ Rental Approved",
  body: `Your request for "${booking.item.title}" was approved. Check your rentals for the pickup code.`,
  link: "/rentals/my-bookings",
})
    
  } else {
    await prisma.rentalBooking.update({
      where: { id: booking.id },
      data: { status: "REJECTED" },
    })

await notifyUser({
  userId: booking.renterId,
  type: "RENTAL_REQUEST",
  title: "Rental Request Declined",
  body: `Your request for "${booking.item.title}" was declined by the owner.`,
  link: "/rentals/my-bookings",
})
  }

  return NextResponse.json({ success: true })
}