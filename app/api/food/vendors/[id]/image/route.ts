import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFoodUser, canManageVendor, uploadFoodImage } from "@/lib/food-server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getFoodUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const vendor = await prisma.foodVendor.findUnique({ where: { id: Number(id) } })
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
  if (!canManageVendor(user, vendor)) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const fd = await req.formData()
  const file = fd.get("image")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 })
  }

  const up = await uploadFoodImage(file)
  if (up.error) return NextResponse.json({ error: up.error }, { status: 400 })

  await prisma.foodVendor.update({ where: { id: vendor.id }, data: { imageUrl: up.url } })
  return NextResponse.json({ imageUrl: up.url })
}