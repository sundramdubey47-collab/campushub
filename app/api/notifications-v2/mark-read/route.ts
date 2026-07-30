import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login required" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { notificationId } = body

  if (notificationId) {
    await prisma.notification.update({
      where: { id: Number(notificationId) },
      data: { isRead: true },
    })
  } else {
    // Sab ek saath mark-read (jab dropdown khole to)
    await prisma.notification.updateMany({
      where: { userId: dbUser.id, isRead: false },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ success: true })
}