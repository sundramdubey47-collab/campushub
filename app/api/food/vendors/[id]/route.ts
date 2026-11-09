import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getFoodUser, isFoodAdmin, canManageVendor, vendorSchema, cleanPhone } from "@/lib/food-server"
import { formatZodError } from "@/lib/validations"

const patchSchema = vendorSchema.partial().extend({
  isOpenNow: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const vendorId = Number(id)
  if (!Number.isInteger(vendorId)) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })

  const vendor = await prisma.foodVendor.findUnique({
    where: { id: vendorId },
    include: {
      menuItems: { orderBy: [{ category: "asc" }, { name: "asc" }] },
      manager: { select: { name: true, email: true } },
    },
  })

  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (!canManageVendor(user, vendor)) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const grouped = await prisma.foodEnquiry.groupBy({
    by: ["kind"],
    where: { vendorId },
    _count: { _all: true },
  })

  const stats = {
    orderClicks: grouped.find((g) => g.kind === "ORDER_CLICK")?._count._all ?? 0,
    trialRequests: grouped.find((g) => g.kind === "TRIAL_REQUEST")?._count._all ?? 0,
  }

  return NextResponse.json({ vendor, stats, isAdmin: isFoodAdmin(user.role) })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findUnique({ where: { id: Number(id) } })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (!canManageVendor(user, vendor)) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })

  const { phone, whatsapp, ...rest } = parsed.data
  const update: Record<string, unknown> = { ...rest }

  if (rest.isActive !== undefined && !isFoodAdmin(user.role)) {
    return NextResponse.json({ error: "Only admins can hide or show a vendor" }, { status: 403 })
  }

  if (phone !== undefined) {
    const p = cleanPhone(phone)
    if (!p) return NextResponse.json({ error: "Enter a valid 10-digit phone number" }, { status: 400 })
    update.phone = p
  }

  if (whatsapp !== undefined) {
    if (!whatsapp) {
      update.whatsapp = null
    } else {
      const w = cleanPhone(whatsapp)
      if (!w) return NextResponse.json({ error: "Enter a valid 10-digit WhatsApp number" }, { status: 400 })
      update.whatsapp = w
    }
  }

  const updated = await prisma.foodVendor.update({ where: { id: vendor.id }, data: update as any })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })
  if (!isFoodAdmin(user.role)) return NextResponse.json({ error: "Only admins can delete a vendor" }, { status: 403 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findUnique({ where: { id: Number(id) } })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (!canManageVendor(user, vendor)) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  await prisma.foodVendor.delete({ where: { id: vendor.id } })
  return NextResponse.json({ success: true })
}