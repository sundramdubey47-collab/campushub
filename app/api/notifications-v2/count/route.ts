import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ count: 0 })

  const count = await prisma.notification.count({
    where: { isRead: false, user: { email } },
  })

  return NextResponse.json({ count })
}