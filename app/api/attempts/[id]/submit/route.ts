import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const { id } = await params
  const body = await req.json()
  const answers = body.answers as { questionId: number; selectedIndex: number | null }[]

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: Number(id) },
    include: { test: true },
  })

  if (!attempt || attempt.userId !== dbUser.id) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }

  if (attempt.submittedAt) {
    return NextResponse.json({ error: "This attempt is alredy exist" }, { status: 400 })
  }

  const questions = await prisma.testQuestion.findMany({
    where: { testId: attempt.testId },
  })

  let score = 0

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) continue

    const isCorrect = answer.selectedIndex !== null && answer.selectedIndex === question.correctIndex

    if (isCorrect) {
      score += 1
    } else if (answer.selectedIndex !== null) {
      score -= attempt.test.negativeMarking
    }

    await prisma.testAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        selectedIndex: answer.selectedIndex,
        isCorrect,
      },
    })
  }

  await prisma.testAttempt.update({
    where: { id: attempt.id },
    data: { score: Math.round(score), submittedAt: new Date() },
  })

  return NextResponse.json({ score: Math.round(score), totalQuestions: attempt.totalQuestions })
}