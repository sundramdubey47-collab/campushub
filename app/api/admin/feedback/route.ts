import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  })

  return NextResponse.json(feedbacks)
}