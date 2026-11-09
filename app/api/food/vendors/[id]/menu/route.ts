import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFoodUser, canManageVendor, menuItemSchema } from "@/lib/food-server"
import { formatZodError } from "@/lib/validations"

const MAX_ITEMS_PER_VENDOR = 200

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findUnique({ where: { id: Number(id) } })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (!canManageVendor(user, vendor)) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const parsed = menuItemSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })

  const count = await prisma.menuItem.count({ where: { vendorId: vendor.id } })
  if (count >= MAX_ITEMS_PER_VENDOR) {
    return NextResponse.json({ error: `A vendor can have at most ${MAX_ITEMS_PER_VENDOR} menu items` }, { status: 400 })
  }

  const item = await prisma.menuItem.create({
    data: { ...parsed.data, vendorId: vendor.id } as any,
  })

  return NextResponse.json(item)
}