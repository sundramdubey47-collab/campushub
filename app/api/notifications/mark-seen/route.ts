import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Login required" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 400 })

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { lastSeenNotificationsAt: new Date() },
  })

  return NextResponse.json({ success: true })
}