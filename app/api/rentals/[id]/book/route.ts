import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendPushNotification } from "@/lib/notification-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const { id } = await params
  const body = await req.json()
  const { startDate, expectedReturnDate, couponCode } = body

  if (!startDate || !expectedReturnDate) {
    return NextResponse.json({ error: "Both dates are required" }, { status: 400 })
  }

 const item = await prisma.rentalItem.findUnique({
  where: { id: Number(id) },
  include: {
    owner: true,
  },
})

  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
  if (item.status !== "AVAILABLE") return NextResponse.json({ error: "This item is not available right now" }, { status: 400 })
  if (item.ownerId === dbUser.id) return NextResponse.json({ error: "You cannot rent your own item" }, { status: 400 })
   const existingBooking = await prisma.rentalBooking.findFirst({
  where: {
    itemId: item.id,
    renterId: dbUser.id,
    status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
  },
})

if (existingBooking) {
  return NextResponse.json({ error: "You already have an active or pending request for this item" }, { status: 400 })
} 

  let rentAmount = item.price
  let couponUsed = false
  let platformAbsorbed = 0

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })

    if (!coupon) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 })
    if (coupon.isUsed) return NextResponse.json({ error: "Coupon already used" }, { status: 400 })
    if (coupon.ownerId !== dbUser.id) return NextResponse.json({ error: "This coupon is not yours" }, { status: 400 })

    const discountAmount = Math.round((item.price * coupon.discountPercent) / 100)
    platformAbsorbed = discountAmount
    couponUsed = true

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { isUsed: true, usedAt: new Date() },
    })
  }

  // Note: item status "AVAILABLE" hi rehta hai jab tak owner approve na kare
const booking = await prisma.rentalBooking.create({
  data: {
    renterId: dbUser.id,
    itemId: item.id,
    startDate: new Date(startDate),
    expectedReturnDate: new Date(expectedReturnDate),
    rentAmount,
    securityDeposit: item.securityDeposit,
    couponUsed,
    platformAbsorbed,
    status: "PENDING",
  },
})

await sendPushNotification({
    userId: item.ownerId,
    title: "📦 New Rental Request",
    body: `${dbUser.name} wants to rent your "${item.title}". Check your requests.`,
    url: "/rentals/my-bookings",
  })

  
return NextResponse.json(booking)
}