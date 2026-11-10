import { NextResponse, after } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { notifyUser } from "@/lib/notify"

const include = {
  user: { select: { id: true, name: true } },
  replyTo: { include: { user: { select: { id: true, name: true } } } },
} as const

async function currentUser() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, collegeId: true },
  })
}

export async function GET(req: Request) {
  const me = await currentUser()
  if (!me?.collegeId) return NextResponse.json([])

  const afterId = Number(new URL(req.url).searchParams.get("after")) || 0
  const notBlocked = { user: { blockedByUsers: { none: { blockerId: me.id } } } }

  if (afterId > 0) {
    const fresh = await prisma.campusChatMessage.findMany({
      where: { collegeId: me.collegeId, id: { gt: afterId }, ...notBlocked },
      orderBy: { id: "asc" },
      take: 100,
      include,
    })
    return NextResponse.json(fresh)
  }

  const latest = await prisma.campusChatMessage.findMany({
    where: { collegeId: me.collegeId, ...notBlocked },
    orderBy: { id: "desc" },
    take: 50,
    include,
  })
  return NextResponse.json(latest.reverse())
}

export async function POST(req: Request) {
  const me = await currentUser()
  if (!me) return NextResponse.json({ error: "Login is required" }, { status: 401 })
  if (!me.collegeId) return NextResponse.json({ error: "Your college is not set" }, { status: 400 })

  const rate = checkRateLimit(`campus-chat:${me.id}`, RATE_LIMITS.PUBLIC_MODERATE)
  if (!rate.allowed) {
    return NextResponse.json({ error: "You're sending messages too fast. Slow down a little." }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const content = typeof body.content === "string" ? body.content.trim() : ""
  const replyToId = body.replyToId ? Number(body.replyToId) : null

  if (!content || content.length > 500) {
    return NextResponse.json({ error: "Message must be between 1 and 500 characters" }, { status: 400 })
  }

  const message = await prisma.campusChatMessage.create({
    data: { content, userId: me.id, collegeId: me.collegeId, replyToId },
    include,
  })

  // Reply par sirf us bande ko notification, aur wo bhi response jaane ke BAAD
  if (message.replyTo && message.replyTo.user.id !== me.id) {
    const targetId = message.replyTo.user.id
    after(() =>
      notifyUser({
        userId: targetId,
        type: "SYSTEM",
        title: "💬 Someone replied to you",
        body: `${me.name}: ${content.slice(0, 50)}`,
        link: "/chat",
      })
    )
  }

  return NextResponse.json(message)
}