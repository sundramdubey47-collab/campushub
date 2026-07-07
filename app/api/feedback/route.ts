import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login required" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const body = await req.json()
  const { message, page } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
  }

  await prisma.feedback.create({
    data: { message, page, userId: dbUser.id },
  })

  return NextResponse.json({ success: true })
}