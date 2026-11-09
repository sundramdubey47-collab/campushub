import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFoodUser } from "@/lib/food-server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user?.collegeId) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findFirst({
    where: { id: Number(id), isActive: true, collegeId: user.collegeId },
  })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (vendor.managerId === user.id) {
    return NextResponse.json({ error: "You can't rate your own place" }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const value = Number(body.value)
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
  }

  await prisma.foodRating.upsert({
    where: { userId_vendorId: { userId: user.id, vendorId: vendor.id } },
    update: { value },
    create: { userId: user.id, vendorId: vendor.id, value },
  })

  const agg = await prisma.foodRating.aggregate({
    where: { vendorId: vendor.id },
    _avg: { value: true },
    _count: { value: true },
  })

  return NextResponse.json({ avg: agg._avg.value, count: agg._count.value })
}