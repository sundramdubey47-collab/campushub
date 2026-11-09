
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getISTDateString } from "@/lib/time-utils"
import { notifyCollege } from "@/lib/notify"
import { getAIResponse } from "@/lib/ai-provider"

export const dynamic = "force-dynamic"
export const maxDuration = 60

type TriviaQuestion = {
  question: string
  options: string[]
  correctIndex: number
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expectedHeader) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const todayStr = getISTDateString()
    const today = new Date(`${todayStr}T00:00:00.000Z`)

    // All active courses with at least one student
    const courses = await prisma.course.findMany({
      where: {
        students: { some: {} },
      },
      select: {
        id: true,
        name: true,
        department: {
          select: {
            collegeId: true,
          },
        },
      },
    })

    let generated = 0
    let failed = 0

    for (const course of courses) {
      try {
        // Skip if today's quiz already exists
        const existing = await prisma.dailyTrivia.findUnique({
          where: {
            date_courseId: {
              date: today,
              courseId: course.id,
            },
          },
        })

        if (existing) continue

        // Fetch previous questions to avoid repetition
        const previousQuizzes = await prisma.dailyTrivia.findMany({
          where: {
            courseId: course.id,
          },
          orderBy: {
            date: "desc",
          },
          take: 10,
          select: {
            question: true,
          },
        })

        const previousQuestions = previousQuizzes
          .flatMap((quiz) => {
            try {
              const parsed = JSON.parse(quiz.question)

              if (!Array.isArray(parsed)) return []

              return parsed.map((q: TriviaQuestion) => q.question)
            } catch {
              return []
            }
          })
          .join("\n")

        const prompt = `
Generate EXACTLY 5 multiple-choice quiz questions relevant to a student studying "${course.name}".

Requirements:
- Questions must be completely NEW and UNIQUE.
- DO NOT repeat or closely rephrase any previous question.
- Avoid asking the same concept in different words.
- Mix subject-specific and general knowledge related to this field.
- Keep them interesting and not too hard.
- Every question must have exactly 4 options.
- correctIndex must be a number from 0 to 3.
- Questions and options must be factually correct.

Previously generated questions (DO NOT repeat these):

${previousQuestions}

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0
  }
]
`

        // Use common AI provider with automatic fallback
        const aiResponse = await getAIResponse(
          [{ role: "user", content: prompt }],
          "You are a reliable academic quiz generator. Return only valid JSON. Do not include markdown or explanations."
        )

        // Clean and parse AI response
        const cleaned = aiResponse
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()

        const questions: unknown = JSON.parse(cleaned)

        // Validate generated questions
        if (!Array.isArray(questions) || questions.length !== 5) {
          throw new Error("AI must generate exactly 5 questions")
        }

        const validQuestions = questions.every((q: any) => {
          return (
            typeof q.question === "string" &&
            q.question.trim().length > 0 &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.options.every(
              (option: unknown) =>
                typeof option === "string" && option.trim().length > 0
            ) &&
            Number.isInteger(q.correctIndex) &&
            q.correctIndex >= 0 &&
            q.correctIndex <= 3
          )
        })

        if (!validQuestions) {
          throw new Error("AI generated invalid quiz structure")
        }

        // Save today's quiz
        await prisma.dailyTrivia.create({
          data: {
            date: today,
            courseId: course.id,
            question: JSON.stringify(questions),
            options: [],
            correctIndex: 0,
          },
        })

        generated++

        // Notify students in the respective college
        await notifyCollege({
          collegeId: course.department.collegeId,
          type: "QUIZ_LIVE",
          title: "🧠 Today's Quiz is Live!",
          body: `5 new questions for ${course.name} students — test your knowledge now!`,
          link: "/dashboard",
          courseId: course.id,
        })
      } catch (error) {
        failed++

        console.error(
          `Trivia generation failed for course ${course.id}:`,
          error
        )
      }
    }

    return NextResponse.json({
      success: true,
      generated,
      failed,
      totalCourses: courses.length,
    })
  } catch (error) {
    console.error("[Trivia Cron Error]", error)

    return NextResponse.json(
      { error: "Failed to generate daily trivia" },
      { status: 500 }
    )
  }
}
