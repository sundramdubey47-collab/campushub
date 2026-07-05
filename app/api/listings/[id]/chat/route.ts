import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const messages = await prisma.chatMessage.findMany({
    where: { listingId: Number(id) },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true, id: true } } },
  })

  return NextResponse.json(messages)
}

export async function POST(
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
  const body = await req.json()
  const content = body.content?.trim()

  if (!content) {
    return NextResponse.json({ error: "You can't send empty message " }, { status: 400 })
  }

  const message = await prisma.chatMessage.create({
    data: { content, senderId: dbUser.id, listingId: Number(id) },
    include: { sender: { select: { name: true, id: true } } },
  })

  return NextResponse.json(message)
}