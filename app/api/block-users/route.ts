import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const body = await req.json()
  const { targetUserId } = body

  if (!targetUserId || Number(targetUserId) === dbUser.id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const existing = await prisma.blockedUser.findUnique({
    where: { blockerId_blockedId: { blockerId: dbUser.id, blockedId: Number(targetUserId) } },
  })

  if (existing) {
    await prisma.blockedUser.delete({ where: { id: existing.id } })
    return NextResponse.json({ blocked: false })
  }

  await prisma.blockedUser.create({
    data: { blockerId: dbUser.id, blockedId: Number(targetUserId) },
  })

  return NextResponse.json({ blocked: true })
}

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json([])

  const blocked = await prisma.blockedUser.findMany({
    where: { blockerId: dbUser.id },
    include: { blocked: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(blocked)
}