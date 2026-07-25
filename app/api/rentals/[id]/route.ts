import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const item = await prisma.rentalItem.findUnique({
    where: { id: Number(id) },
    include: { owner: { select: { name: true, phone: true } } },
  })
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const item = await prisma.rentalItem.findUnique({ where: { id: Number(id) } })

  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })
  if (item.ownerId !== dbUser.id) return NextResponse.json({ error: "You can only delete your own listing" }, { status: 403 })
  if (item.status !== "AVAILABLE") return NextResponse.json({ error: "Cannot delete an item that is currently rented out" }, { status: 400 })

  await prisma.rentalItem.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}