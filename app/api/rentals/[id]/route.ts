import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function currentUser() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, collegeId: true, role: true },
  })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const itemId = Number(id)
  if (!Number.isInteger(itemId)) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  const item = await prisma.rentalItem.findUnique({
    where: { id: itemId },
    include: { owner: { select: { id: true, name: true, phone: true } } },
  })

  // Doosre college ka item nahi dikhna chahiye
  if (!item || (item.collegeId !== user.collegeId && user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  return NextResponse.json({ ...item, isOwner: item.ownerId === user.id })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const itemId = Number(id)
  if (!Number.isInteger(itemId)) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  const item = await prisma.rentalItem.findUnique({ where: { id: itemId }, select: { id: true, ownerId: true } })
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })

  // Sirf wahi delete kar sakta hai jisne ye item dala hai
  if (item.ownerId !== user.id) {
    return NextResponse.json({ error: "You can only delete your own listing" }, { status: 403 })
  }

  const open = await prisma.rentalBooking.count({
    where: { itemId, status: { in: ["PENDING", "APPROVED", "ACTIVE", "OVERDUE"] } },
  })
  if (open > 0) {
    return NextResponse.json(
      { error: "A request or rental is currently active for this item. Please reject the request or complete the return first, then delete the item.." },
      { status: 400 }
    )
  }

  await prisma.$transaction([
    prisma.rentalBooking.deleteMany({ where: { itemId } }),
    prisma.rentalItem.delete({ where: { id: itemId } }),
  ])

  return NextResponse.json({ success: true })
}