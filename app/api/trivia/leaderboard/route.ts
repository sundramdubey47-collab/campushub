import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getISTDateString } from "@/lib/time-utils"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser?.courseId) return NextResponse.json([])

  const today = new Date(`${getISTDateString()}T00:00:00.000Z`)
  const trivia = await prisma.dailyTrivia.findUnique({
    where: { date_courseId: { date: today, courseId: dbUser.courseId } },
  })
  if (!trivia) return NextResponse.json([])

  // Sबसे zyada sahi jawab, फिर sबसे kam time — yahी sahi ranking hai
  const attempts = await prisma.triviaAttempt.findMany({
    where: { triviaId: trivia.id },
    orderBy: [{ score: "desc" }, { createdAt: "asc" }],
    take: 20,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(
    attempts.map((a, i) => ({ rank: i + 1, name: a.user.name, score: (a as any).score, time: a.createdAt }))
  )
}