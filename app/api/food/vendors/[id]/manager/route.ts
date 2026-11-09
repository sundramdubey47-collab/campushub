import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notifyUser } from "@/lib/notify"
import { getFoodUser, isFoodAdmin, canManageVendor } from "@/lib/food-server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })
  if (!isFoodAdmin(user.role)) return NextResponse.json({ error: "Only admins can assign a manager" }, { status: 403 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findUnique({ where: { id: Number(id) } })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (!canManageVendor(user, vendor)) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

  if (!email) {
    await prisma.foodVendor.update({ where: { id: vendor.id }, data: { managerId: null } })
    return NextResponse.json({ success: true, manager: null })
  }

  const target = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, collegeId: true },
  })

  if (!target) return NextResponse.json({ error: "No user found with this email" }, { status: 404 })
  if (target.collegeId !== vendor.collegeId) {
    return NextResponse.json({ error: "This user belongs to a different college" }, { status: 400 })
  }

  await prisma.foodVendor.update({ where: { id: vendor.id }, data: { managerId: target.id } })

  await notifyUser({
    userId: target.id,
    type: "FOOD",
    title: "🍽️ You can now manage a menu",
    body: `You've been added as manager of ${vendor.name}`,
    link: `/food/${vendor.id}/manage`,
  })

  return NextResponse.json({ success: true, manager: { name: target.name, email: target.email } })
}