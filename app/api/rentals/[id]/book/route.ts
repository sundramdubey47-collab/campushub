import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User nahi mila" }, { status: 400 })

  const { id } = await params
  const body = await req.json()
  const { startDate, expectedReturnDate, couponCode } = body

  if (!startDate || !expectedReturnDate) {
    return NextResponse.json({ error: "Start date aur Return date zaroori hai" }, { status: 400 })
  }

  const item = await prisma.rentalItem.findUnique({ where: { id: Number(id) } })

  if (!item) return NextResponse.json({ error: "Item nahi mila" }, { status: 404 })
  if (item.status !== "AVAILABLE") return NextResponse.json({ error: "Ye item abhi available nahi hai" }, { status: 400 })
  if (item.ownerId === dbUser.id) return NextResponse.json({ error: "Apna khud ka item rent nahi kar sakte" }, { status: 400 })

  let rentAmount = item.price
  let couponUsed = false
  let platformAbsorbed = 0

  // Coupon apply karna (agar diya gaya hai)
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })

    if (!coupon) {
      return NextResponse.json({ error: "Coupon invalid hai" }, { status: 400 })
    }
    if (coupon.isUsed) {
      return NextResponse.json({ error: "Coupon already use ho chuka hai" }, { status: 400 })
    }
    if (coupon.ownerId !== dbUser.id) {
      return NextResponse.json({ error: "Ye coupon aapka nahi hai" }, { status: 400 })
    }

    const discountAmount = Math.round((item.price * coupon.discountPercent) / 100)
    platformAbsorbed = discountAmount
    couponUsed = true
    // Doc rule: seller ko poora amount milta hai, CampusHub discount ka bojh uthata hai
    // Isliye rentAmount seller ke liye same hi rehta hai, sirf platformAbsorbed track hota hai

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { isUsed: true, usedAt: new Date() },
    })
  }

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
    },
  })

  await prisma.rentalItem.update({
    where: { id: item.id },
    data: { status: "RENTED" },
  })

  return NextResponse.json(booking)
}