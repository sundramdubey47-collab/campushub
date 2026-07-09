import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const body = await req.json()
  const { phone } = body

  if (phone && !/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 })
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { phone: phone || null },
  })

  return NextResponse.json({ success: true })
}