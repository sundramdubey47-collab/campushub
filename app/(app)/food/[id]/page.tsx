import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getFoodUser, canManageVendor } from "@/lib/food-server"
import { computeOpenNow } from "@/lib/food-shared"
import { FoodVendorView } from "@/components/food-vendor-view"

export default async function FoodVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vendorId = Number(id)
  if (!Number.isInteger(vendorId)) notFound()

  const user = await getFoodUser()
  if (!user?.collegeId) notFound()

  const vendor = await prisma.foodVendor.findFirst({
    where: { id: vendorId, isActive: true, collegeId: user.collegeId },
    include: { menuItems: { orderBy: [{ category: "asc" }, { name: "asc" }] } },
  })
  if (!vendor) notFound()

  const [agg, mine] = await Promise.all([
    prisma.foodRating.aggregate({
      where: { vendorId },
      _avg: { value: true },
      _count: { value: true },
    }),
    prisma.foodRating.findUnique({ where: { userId_vendorId: { userId: user.id, vendorId } } }),
  ])

  return (
    <FoodVendorView
      vendor={{
        id: vendor.id,
        name: vendor.name,
        type: vendor.type,
        description: vendor.description,
        area: vendor.area,
        address: vendor.address,
        phone: vendor.phone,
        whatsapp: vendor.whatsapp,
        openTime: vendor.openTime,
        closeTime: vendor.closeTime,
        imageUrl: vendor.imageUrl,
        isVegOnly: vendor.isVegOnly,
        hasDelivery: vendor.hasDelivery,
        deliveryNote: vendor.deliveryNote,
        monthlyPrice: vendor.monthlyPrice,
        trialMealPrice: vendor.trialMealPrice,
        weeklyMenu: vendor.weeklyMenu,
        isOpen: computeOpenNow(vendor),
      }}
      items={vendor.menuItems.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        price: i.price,
        diet: i.diet,
        category: i.category,
        isAvailable: i.isAvailable,
        isSpecial: i.isSpecial,
      }))}
      rating={{ avg: agg._avg.value, count: agg._count.value }}
      myRating={mine?.value ?? null}
      canManage={canManageVendor(user, vendor)}
      isOwnPlace={vendor.managerId === user.id}
    />
  )
}