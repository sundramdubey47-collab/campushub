import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json([])

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) return NextResponse.json([])

  const items = await prisma.rentalItem.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      pricingType: true,
      status: true,
      imageUrl: true,
      bookings: {
        where: { status: { in: ["PENDING", "APPROVED", "ACTIVE", "OVERDUE"] } },
        select: { id: true },
      },
    },
  })

  return NextResponse.json(
    items.map(({ bookings, ...rest }) => ({ ...rest, openBookings: bookings.length }))
  )
}