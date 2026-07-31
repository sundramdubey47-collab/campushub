import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getISTDateString } from "@/lib/time-utils"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser?.courseId) return NextResponse.json({ trivia: null })

  const today = new Date(`${getISTDateString()}T00:00:00.000Z`)
  const trivia = await prisma.dailyTrivia.findUnique({
    where: { date_courseId: { date: today, courseId: dbUser.courseId } },
  })

  if (!trivia) return NextResponse.json({ trivia: null })

  const attempted = await prisma.triviaAttempt.findUnique({
    where: { userId_triviaId: { userId: dbUser.id, triviaId: trivia.id } },
  })

  const questions = JSON.parse(trivia.question)

  const streak = await prisma.userStreak.findUnique({ where: { userId: dbUser.id } })

  return NextResponse.json({
    trivia: { id: trivia.id, questions: questions.map((q: any) => ({ question: q.question, options: q.options })) },
    alreadyAttempted: !!attempted,
    previousScore: attempted ? (attempted as any).score : null,
    streak: streak?.currentStreak ?? 0,
  })
}

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login required" }, { status: 401 })

  const body = await req.json()
  const { triviaId, answers } = body // answers = array of selected indexes, length 5

  const trivia = await prisma.dailyTrivia.findUnique({ where: { id: Number(triviaId) } })
  if (!trivia) return NextResponse.json({ error: "Quiz not found" }, { status: 404 })

  const existing = await prisma.triviaAttempt.findUnique({
    where: { userId_triviaId: { userId: dbUser.id, triviaId: trivia.id } },
  })
  if (existing) return NextResponse.json({ error: "Already attempted today" }, { status: 400 })

  const questions = JSON.parse(trivia.question)
  let correctCount = 0
  questions.forEach((q: any, i: number) => {
    if (answers[i] === q.correctIndex) correctCount++
  })

  const isOverallCorrect = correctCount >= 3 // 5 me se 3+ sahi ho to "pass" mानते hain streak ke liye

  await prisma.triviaAttempt.create({
    data: { userId: dbUser.id, triviaId: trivia.id, isCorrect: isOverallCorrect },
  })

  const streak = await prisma.userStreak.findUnique({ where: { userId: dbUser.id } })
  let newStreak = 1
  if (streak?.lastPlayedDate) {
    const lastDate = new Date(streak.lastPlayedDate).toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    if (lastDate === yesterday && isOverallCorrect) newStreak = streak.currentStreak + 1
    else if (!isOverallCorrect) newStreak = 0
  }
  const bestStreak = Math.max(streak?.bestStreak ?? 0, newStreak)

  await prisma.userStreak.upsert({
    where: { userId: dbUser.id },
    update: { currentStreak: newStreak, bestStreak, lastPlayedDate: new Date() },
    create: { userId: dbUser.id, currentStreak: newStreak, bestStreak: newStreak, lastPlayedDate: new Date() },
  })

  return NextResponse.json({ score: correctCount, total: questions.length, streak: newStreak })
}