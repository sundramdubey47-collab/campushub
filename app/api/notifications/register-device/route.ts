import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login required" }, { status: 401 })

  const body = await req.json()
  const { fcmToken } = body

  if (!fcmToken) return NextResponse.json({ error: "Token is required" }, { status: 400 })

  await prisma.userDevice.upsert({
    where: { fcmToken },
    update: { userId: dbUser.id },
    create: { fcmToken, userId: dbUser.id },
  })

  return NextResponse.json({ success: true })
}