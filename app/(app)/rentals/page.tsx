import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { RentalsClient } from "@/components/rentals-client"

export default async function RentalsPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { collegeId: true },
  })

  const items = dbUser?.collegeId
    ? await prisma.rentalItem.findMany({
        where: { collegeId: dbUser.collegeId, status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true } } },
      })
    : []

  const serialized = items.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }))

  return <RentalsClient initialItems={serialized} />
}