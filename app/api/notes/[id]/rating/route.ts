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
  const body = await req.json()
  const value = Number(body.value)

  if (value < 1 || value > 5) {
    return NextResponse.json({ error: "Rating 1 se 5 ke beech honi chahiye" }, { status: 400 })
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