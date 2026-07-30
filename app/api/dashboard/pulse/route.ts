import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser?.collegeId) return NextResponse.json(null)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [newNotes, testAttempts, chatMessages] = await Promise.all([
    prisma.note.count({ where: { university: { colleges: { some: { id: dbUser.collegeId } } }, createdAt: { gte: todayStart } } }),
    prisma.testAttempt.count({ where: { user: { collegeId: dbUser.collegeId }, startedAt: { gte: todayStart } } }),
    prisma.campusChatMessage.count({ where: { collegeId: dbUser.collegeId, createdAt: { gte: todayStart } } }),
  ])

  return NextResponse.json({ newNotes, testAttempts, chatMessages })
}