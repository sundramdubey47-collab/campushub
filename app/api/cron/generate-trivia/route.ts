import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getISTDateString } from "@/lib/time-utils"
import { notifyCollege } from "@/lib/notify"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  const expectedHeader = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedHeader) {
    console.error("[Cron Auth Failed] Received:", authHeader?.slice(0, 15), "Expected prefix:", expectedHeader.slice(0, 15))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ...baaki function same rahega

  const todayStr = getISTDateString()
  const today = new Date(`${todayStr}T00:00:00.000Z`)

  // Sabhi active branches (jinme kam se kam 1 student hai) ke liye alag-alag quiz banayenge
  const courses = await prisma.course.findMany({
  where: { students: { some: {} } },
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

  for (const course of courses) {
    const existing = await prisma.dailyTrivia.findUnique({
      where: { date_courseId: { date: today, courseId: course.id } },
    })
    if (existing) continue

    const prompt = `Generate exactly 5 multiple-choice quiz questions relevant to a student studying "${course.name}". 
Mix of subject-specific and general-knowledge-for-this-field questions. Keep them interesting and not too hard.
Return ONLY a JSON array, no other text, in this exact format:
[{"question": "...", "options": ["A","B","C","D"], "correctIndex": 0}, ...]`

    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      })

      const text = response.choices[0]?.message?.content || "[]"
      const cleaned = text.replace(/```json|```/g, "").trim()
      const questions = JSON.parse(cleaned)

      if (!Array.isArray(questions) || questions.length === 0) continue

      // Pehla question hi "aaj ka quiz" ban jaata hai (5 questions ek session me)
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

      // Us branch ke students ko notification
     await notifyCollege({
  collegeId: course.department.collegeId,
  type: "QUIZ_LIVE",
  title: "🧠 Today's Quiz is Live!",
  body: `5 new questions for ${course.name} students — test your knowledge now!`,
  link: "/dashboard",
})
    } catch (err) {
      console.error(`Trivia generation failed for course ${course.id}:`, err)
    }
  }

  return NextResponse.json({ success: true, generated })
}