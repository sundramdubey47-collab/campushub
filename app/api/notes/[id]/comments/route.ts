import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const comments = await prisma.comment.findMany({
    where: { noteId: Number(id) },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(comments)
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
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  const { id } = await params
  const body = await req.json()
  const content = body.content?.trim()

  if (!content) {
    return NextResponse.json({ error: "Comments can't be empty" }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: { content, userId: dbUser.id, noteId: Number(id) },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(comment)
}