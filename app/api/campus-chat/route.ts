import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser?.collegeId) return NextResponse.json([])

  const messages = await prisma.campusChatMessage.findMany({
    where: { collegeId: dbUser.collegeId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(messages.reverse())
}

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })
  if (!dbUser.collegeId) return NextResponse.json({ error: "Your college is not set" }, { status: 400 })

  const result = checkRateLimit(`campus-chat:${dbUser.id}`, RATE_LIMITS.PUBLIC_MODERATE)
  if (!result.allowed) {
    return NextResponse.json({ error: "You're sending messages too fast. Slow down a little." }, { status: 429 })
  }

  const body = await req.json()
  const content = body.content?.trim()

  if (!content || content.length > 500) {
    return NextResponse.json({ error: "Message must be between 1 and 500 characters" }, { status: 400 })
  }

  const message = await prisma.campusChatMessage.create({
    data: { content, userId: dbUser.id, collegeId: dbUser.collegeId },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(message)
}