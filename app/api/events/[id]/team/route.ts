import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const eventId = Number(id)

  const membership = await prisma.eventTeamMember.findUnique({
    where: { eventId_userId: { eventId, userId: dbUser.id } },
  })

  if (membership?.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only the event organizer can add volunteers" }, { status: 403 })
  }

  const body = await req.json()
  const { email } = body

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) return NextResponse.json({ error: "No user found with this email" }, { status: 404 })

  const existing = await prisma.eventTeamMember.findUnique({
    where: { eventId_userId: { eventId, userId: targetUser.id } },
  })
  if (existing) return NextResponse.json({ error: "This user is already part of the team" }, { status: 400 })

  const member = await prisma.eventTeamMember.create({
    data: { eventId, userId: targetUser.id, role: "VOLUNTEER" },
  })

  return NextResponse.json(member)
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const team = await prisma.eventTeamMember.findMany({
    where: { eventId: Number(id) },
    include: { user: { select: { name: true, email: true } } },
  })
  return NextResponse.json(team)
}