import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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
  const value = Number(body.value)

  if (value < 1 || value > 5) {
    return NextResponse.json({ error: "Rating must be b/w 1 to 5" }, { status: 400 })
  }

  await prisma.rating.upsert({
    where: { userId_noteId: { userId: dbUser.id, noteId: Number(id) } },
    update: { value },
    create: { userId: dbUser.id, noteId: Number(id), value },
  })

  const avg = await prisma.rating.aggregate({
    where: { noteId: Number(id) },
    _avg: { value: true },
    _count: true,
  })

  return NextResponse.json({
    average: avg._avg.value,
    count: avg._count,
  })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const avg = await prisma.rating.aggregate({
    where: { noteId: Number(id) },
    _avg: { value: true },
    _count: true,
  })

  return NextResponse.json({
    average: avg._avg.value,
    count: avg._count,
  })
}