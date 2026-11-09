import { prisma } from "@/lib/prisma"
import { getFoodUser, isFoodAdmin } from "@/lib/food-server"
import { computeOpenNow } from "@/lib/food-shared"
import { FoodClient } from "@/components/food-client"
import { EmptyState } from "@/components/empty-state"
import { Utensils } from "lucide-react"

export default async function FoodPage() {
  const user = await getFoodUser()

  if (!user?.collegeId) {
    return <EmptyState icon={Utensils} title="Complete onboarding first" description="Select your college to see food options near you" />
  }

  const collegeId = user.collegeId

  const [vendors, ratings, specials, managedCount] = await Promise.all([
    prisma.foodVendor.findMany({
      where: { collegeId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, type: true, area: true, imageUrl: true, openTime: true, closeTime: true,
        isVegOnly: true, hasDelivery: true, monthlyPrice: true, phone: true, whatsapp: true, isOpenNow: true,
      },
    }),
    prisma.foodRating.groupBy({
      by: ["vendorId"],
      where: { vendor: { collegeId } },
      _avg: { value: true },
      _count: { value: true },
    }),
    prisma.menuItem.findMany({
      where: { isSpecial: true, isAvailable: true, vendor: { collegeId, isActive: true } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { vendor: { select: { id: true, name: true, phone: true, whatsapp: true } } },
    }),
    prisma.foodVendor.count({ where: { managerId: user.id } }),
  ])

  const ratingMap = new Map(ratings.map((r) => [r.vendorId, { avg: r._avg.value, count: r._count.value }]))

  const cards = vendors
    .map((v) => ({
      id: v.id,
      name: v.name,
      type: v.type,
      area: v.area,
      imageUrl: v.imageUrl,
      openTime: v.openTime,
      closeTime: v.closeTime,
      isVegOnly: v.isVegOnly,
      hasDelivery: v.hasDelivery,
      monthlyPrice: v.monthlyPrice,
      phone: v.phone,
      whatsapp: v.whatsapp,
      isOpen: computeOpenNow(v),
      avgRating: ratingMap.get(v.id)?.avg ?? null,
      ratingCount: ratingMap.get(v.id)?.count ?? 0,
    }))
    .sort((a, b) => Number(b.isOpen) - Number(a.isOpen))

  const specialCards = specials.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    diet: s.diet,
    vendor: s.vendor,
  }))

  return <FoodClient vendors={cards} specials={specialCards} canManage={isFoodAdmin(user.role) || managedCount > 0} />
}