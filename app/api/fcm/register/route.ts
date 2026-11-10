import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Purane clients ke liye compatibility route. Naya code /api/notifications/register-device use karta hai.
export async function POST(req: Request) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "Login required" }, { status: 401 })

  // Hamesha email se user dhoondo (session ki id par bharosa mat karo, wo purani/deleted ho sakti hai)
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) {
    return NextResponse.json({ error: "Account not found. Please log in again." }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const token =
    typeof body.fcmToken === "string" ? body.fcmToken : typeof body.token === "string" ? body.token : ""

  if (token.length < 50 || token.length > 4096) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  await prisma.userDevice.upsert({
    where: { fcmToken: token },
    update: { userId: user.id },
    create: { fcmToken: token, userId: user.id },
  })

  return NextResponse.json({ success: true })
}