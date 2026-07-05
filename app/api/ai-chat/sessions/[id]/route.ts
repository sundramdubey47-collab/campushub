import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const { id } = await params

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: Number(id) },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  if (!chatSession || chatSession.userId !== dbUser.id) {
    return NextResponse.json({ error: "Session expired or not available " }, { status: 404 })
  }

  return NextResponse.json(chatSession)
}