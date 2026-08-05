import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json([])

  const listings = await prisma.listing.findMany({
    where: { sellerId: dbUser.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, price: true, status: true, imageUrl: true },
  })

  return NextResponse.json(listings)
}