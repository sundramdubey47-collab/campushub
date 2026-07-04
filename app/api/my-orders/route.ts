import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser) {
    return NextResponse.json([])
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          title: true,
          imageUrl: true,
          category: true,
          seller: { select: { name: true } },
        },
      },
    },
  })

  return NextResponse.json(orders)
}