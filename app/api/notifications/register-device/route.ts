import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function currentUserId() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null
  // Hamesha email se dhoondo (session ki id purani/deleted ho sakti hai)
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  return user?.id ?? null
}

export async function POST(req: Request) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: "Please log in again" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const token = typeof body.fcmToken === "string" ? body.fcmToken.trim() : ""
  if (token.length < 50 || token.length > 4096) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  const platform = String(body.platform ?? "").toLowerCase().replace(/[^a-z-]/g, "").slice(0, 30) || null

  await prisma.userDevice.upsert({
    where: { fcmToken: token },
    update: { userId, platform },
    create: { fcmToken: token, userId, platform },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ success: true })

  const body = await req.json().catch(() => ({}))
  const token = typeof body.fcmToken === "string" ? body.fcmToken.trim() : ""
  if (token) await prisma.userDevice.deleteMany({ where: { fcmToken: token, userId } })

  return NextResponse.json({ success: true })
}