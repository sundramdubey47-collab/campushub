import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getISTDateString } from "@/lib/time-utils"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser?.collegeId) return NextResponse.json([])

  const today = new Date(`${getISTDateString()}T00:00:00.000Z`)
  const trivia = await prisma.dailyTrivia.findUnique({ where: { date: today } })
  if (!trivia) return NextResponse.json([])

  // Aaj sahi answer dene wale, sबसे pehले answer karने walon ko upar rakhते hue
  const attempts = await prisma.triviaAttempt.findMany({
    where: { triviaId: trivia.id, isCorrect: true, user: { collegeId: dbUser.collegeId } },
    orderBy: { createdAt: "asc" },
    take: 10,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(attempts.map((a, i) => ({ rank: i + 1, name: a.user.name, time: a.createdAt })))
}