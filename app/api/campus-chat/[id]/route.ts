import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const message = await prisma.campusChatMessage.findUnique({ where: { id: Number(id) } })

  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 })
  if (message.userId !== dbUser.id) return NextResponse.json({ error: "You can only edit your own messages" }, { status: 403 })

  const body = await req.json()
  const content = body.content?.trim()
  if (!content) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })

  const updated = await prisma.campusChatMessage.update({
    where: { id: Number(id) },
    data: { content, isEdited: true },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const message = await prisma.campusChatMessage.findUnique({ where: { id: Number(id) } })

  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 })
  if (message.userId !== dbUser.id) return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 })

  await prisma.campusChatMessage.update({
    where: { id: Number(id) },
    data: { content: "", isDeleted: true },
  })

  return NextResponse.json({ success: true })
}