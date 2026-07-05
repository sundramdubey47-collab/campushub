import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateQuestions } from "@/lib/generate-questions"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Sirf Faculty/Admin test bana sakte hain" }, { status: 403 })
  }

  if (!dbUser.collegeId) {
    return NextResponse.json({ error: "Aapki college set nahi hai" }, { status: 400 })
  }

  const body = await req.json()
  const {
    title, topic, difficulty, durationMinutes, negativeMarking,
    isPremium, price, courseId, semesterId, subjectId, questionCount,
  } = body

  if (!title || !topic || !courseId || !semesterId) {
    return NextResponse.json({ error: "Title, Topic, Branch aur Semester zaroori hai" }, { status: 400 })
  }

  let generatedQuestions
  try {
    generatedQuestions = await generateQuestions(topic, difficulty || "MEDIUM", questionCount || 10)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  const test = await prisma.test.create({
    data: {
      title,
      topic,
      difficulty: difficulty || "MEDIUM",
      durationMinutes: durationMinutes || 30,
      negativeMarking: negativeMarking || 0,
      isPremium: !!isPremium,
      price: isPremium ? Number(price) : null,
      createdById: dbUser.id,
      collegeId: dbUser.collegeId,
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      subjectId: subjectId ? Number(subjectId) : null,
      questions: {
        create: generatedQuestions.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
          correctIndex: q.correctIndex,
        })),
      },
    },
  })

  return NextResponse.json(test)
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const tests = await prisma.test.findMany({
    where: { collegeId: dbUser.collegeId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, attempts: true } },
      createdBy: { select: { name: true } },
    },
  })

  return NextResponse.json(tests)
}