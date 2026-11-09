import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getFoodUser } from "@/lib/food-server"
import { computeOpenNow } from "@/lib/food-shared"

export async function GET(req: Request) {
  const user = await getFoodUser()
  if (!user?.collegeId) return NextResponse.json({ dishes: [], vendors: [] })

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? ""
  if (q.length < 2 || q.length > 60) return NextResponse.json({ dishes: [], vendors: [] })

  const contains = { contains: q, mode: "insensitive" as const }

  const [items, vendors] = await Promise.all([
    prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        vendor: { collegeId: user.collegeId, isActive: true },
        OR: [{ name: contains }, { category: contains }, { description: contains }],
      },
      orderBy: { price: "asc" },
      take: 30,
      include: {
        vendor: {
          select: { id: true, name: true, phone: true, whatsapp: true, area: true, openTime: true, closeTime: true, isOpenNow: true },
        },
      },
    }),
    prisma.foodVendor.findMany({
      where: { collegeId: user.collegeId, isActive: true, name: contains },
      take: 10,
      select: { id: true, name: true, type: true, area: true, openTime: true, closeTime: true, isOpenNow: true },
    }),
  ])

  return NextResponse.json({
    dishes: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      diet: i.diet,
      vendor: {
        id: i.vendor.id,
        name: i.vendor.name,
        phone: i.vendor.phone,
        whatsapp: i.vendor.whatsapp,
        area: i.vendor.area,
        isOpen: computeOpenNow(i.vendor),
      },
    })),
    vendors: vendors.map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      area: v.area,
      isOpen: computeOpenNow(v),
    })),
  })
}