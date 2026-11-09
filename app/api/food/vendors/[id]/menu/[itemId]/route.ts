import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFoodUser, canManageVendor, menuItemSchema } from "@/lib/food-server"
import { formatZodError } from "@/lib/validations"

async function loadItemWithAccess(itemId: string) {
  const user = await getFoodUser()
  if (!user) return { error: NextResponse.json({ error: "Login is required" }, { status: 401 }) }

  const item = await prisma.menuItem.findUnique({
    where: { id: Number(itemId) },
    include: { vendor: { select: { id: true, managerId: true, collegeId: true } } },
  })
  if (!item) return { error: NextResponse.json({ error: "Item not found" }, { status: 404 }) }
  if (!canManageVendor(user, item.vendor)) {
    return { error: NextResponse.json({ error: "Permission denied" }, { status: 403 }) }
  }
  return { item }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const result = await loadItemWithAccess(itemId)
  if (result.error) return result.error

  const parsed = menuItemSchema.partial().safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })

  const updated = await prisma.menuItem.update({
    where: { id: result.item!.id },
    data: parsed.data as any,
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const result = await loadItemWithAccess(itemId)
  if (result.error) return result.error

  await prisma.menuItem.delete({ where: { id: result.item!.id } })
  return NextResponse.json({ success: true })
}