import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ asRenter: [], asOwner: [] })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser) {
    return NextResponse.json({ asRenter: [], asOwner: [] })
  }

  const asRenter = await prisma.rentalBooking.findMany({
    where: { renterId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: { item: { select: { title: true, imageUrl: true } } },
  })

  const asOwner = await prisma.rentalBooking.findMany({
    where: { item: { ownerId: dbUser.id } },
    orderBy: { createdAt: "desc" },
    include: {
      item: { select: { title: true, imageUrl: true } },
      renter: { select: { name: true } },
    },
  })

  return NextResponse.json({ asRenter, asOwner })
}