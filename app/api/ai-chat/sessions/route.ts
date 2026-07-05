import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser) {
    return NextResponse.json([])
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  })

  return NextResponse.json(sessions)
}