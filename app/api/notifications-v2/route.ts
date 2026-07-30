import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ items: [], unreadCount: 0 })

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where: { userId: dbUser.id, isRead: false } }),
  ])

  return NextResponse.json({ items, unreadCount })
}