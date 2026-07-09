import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LostFoundClient } from "@/components/lost-found-client"

export default async function LostFoundPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { collegeId: true, id: true },
  })

  const items = dbUser?.collegeId
    ? await prisma.lostFoundItem.findMany({
        where: { collegeId: dbUser.collegeId, isResolved: false },
        orderBy: { createdAt: "desc" },
        include: { reportedBy: { select: { id: true, name: true } } },
      })
    : []

  const serialized = items.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  }))

  return <LostFoundClient initialItems={serialized} currentUserId={dbUser?.id?.toString() ?? ""} />
}