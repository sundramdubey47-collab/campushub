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
  const finalPrice = body.finalPrice ? Number(body.finalPrice) : null

  const listing = await prisma.listing.findUnique({ where: { id: Number(id) } })

  if (!listing) return NextResponse.json({ error: "Listing nahi mili" }, { status: 404 })
  if (listing.status !== "AVAILABLE") return NextResponse.json({ error: "Ye item ab available nahi hai" }, { status: 400 })
  if (listing.sellerId === dbUser.id) return NextResponse.json({ error: "Apna khud ka item nahi khareed sakte" }, { status: 400 })

  const order = await prisma.order.create({
    data: { buyerId: dbUser.id, listingId: Number(id), finalPrice: finalPrice || listing.price },
  })

  await prisma.listing.update({
    where: { id: Number(id) },
    data: { status: "SOLD" },
  })

  return NextResponse.json(order)
}