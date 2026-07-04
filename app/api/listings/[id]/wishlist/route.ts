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

  const existing = await prisma.wishlist.findUnique({
    where: { userId_listingId: { userId: dbUser.id, listingId: Number(id) } },
  })

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } })
    return NextResponse.json({ wishlisted: false })
  } else {
    await prisma.wishlist.create({ data: { userId: dbUser.id, listingId: Number(id) } })
    return NextResponse.json({ wishlisted: true })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ wishlisted: false })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ wishlisted: false })

  const { id } = await params

  const existing = await prisma.wishlist.findUnique({
    where: { userId_listingId: { userId: dbUser.id, listingId: Number(id) } },
  })

  return NextResponse.json({ wishlisted: !!existing })
}