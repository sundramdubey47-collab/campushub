import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { MarketplaceClient } from "@/components/marketplace-client"

export default async function MarketplacePage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { collegeId: true },
  })

  const listings = dbUser?.collegeId
    ? await prisma.listing.findMany({
        where: { collegeId: dbUser.collegeId, status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
        include: { seller: { select: { name: true } } },
      })
    : []

  const serialized = listings.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  return <MarketplaceClient initialListings={serialized} />
}