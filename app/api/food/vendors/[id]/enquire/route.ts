import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notifyUser } from "@/lib/notify"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { getFoodUser } from "@/lib/food-server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user?.collegeId) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const rate = checkRateLimit(`food-enquire:${user.id}`, RATE_LIMITS.PUBLIC_MODERATE)
  if (!rate.allowed) return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findFirst({
    where: { id: Number(id), isActive: true, collegeId: user.collegeId },
  })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const kind = body.kind
  if (kind !== "ORDER_CLICK" && kind !== "TRIAL_REQUEST") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (kind === "TRIAL_REQUEST") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existing = await prisma.foodEnquiry.findFirst({
      where: { userId: user.id, vendorId: vendor.id, kind: "TRIAL_REQUEST", createdAt: { gte: since } },
    })
    if (existing) return NextResponse.json({ success: true, duplicate: true })
  }

  await prisma.foodEnquiry.create({
    data: {
      kind,
      itemName: typeof body.itemName === "string" ? body.itemName.slice(0, 100) : null,
      userId: user.id,
      vendorId: vendor.id,
    },
  })

  if (kind === "TRIAL_REQUEST" && vendor.managerId && vendor.managerId !== user.id) {
    await notifyUser({
      userId: vendor.managerId,
      type: "FOOD",
      title: "🍽️ Trial meal request",
      body: `${user.name} wants to try ${vendor.name}`,
      link: `/food/${vendor.id}/manage`,
    })
  }

  return NextResponse.json({ success: true })
}