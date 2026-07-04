import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) {
    return NextResponse.json({ error: "User nahi mila" }, { status: 400 })
  }

  const { id } = await params

  const existing = await prisma.bookmark.findUnique({
    where: { userId_noteId: { userId: dbUser.id, noteId: Number(id) } },
  })

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    return NextResponse.json({ bookmarked: false })
  } else {
    await prisma.bookmark.create({
      data: { userId: dbUser.id, noteId: Number(id) },
    })
    return NextResponse.json({ bookmarked: true })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ bookmarked: false })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) {
    return NextResponse.json({ bookmarked: false })
  }

  const { id } = await params

  const existing = await prisma.bookmark.findUnique({
    where: { userId_noteId: { userId: dbUser.id, noteId: Number(id) } },
  })

  return NextResponse.json({ bookmarked: !!existing })
}