import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser?.collegeId) {
    return NextResponse.json({ error: "Please complete onboarding first" }, { status: 400 })
  }

  const body = await req.json()
  const { title, description } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: "Please describe what you're looking for" }, { status: 400 })
  }

  const request = await prisma.resourceRequest.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      requestedById: dbUser.id,
      collegeId: dbUser.collegeId,
    },
  })

  return NextResponse.json(request)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json([])

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser?.collegeId) return NextResponse.json([])

  const requests = await prisma.resourceRequest.findMany({
    where: { collegeId: dbUser.collegeId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      requestedBy: { select: { name: true } },
      fulfilledNote: { select: { id: true, title: true } },
    },
  })

  return NextResponse.json(requests)
}