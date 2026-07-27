import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getISTDateString } from "@/lib/time-utils"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const todayStr = getISTDateString()
  const today = new Date(`${todayStr}T00:00:00.000Z`)

  const existing = await prisma.dailyTrivia.findUnique({ where: { date: today } })
  if (existing) return NextResponse.json({ success: true, message: "Already exists" })

  const prompt = `Generate one interesting general-knowledge or light academic trivia question suitable for college students in India. 
Return ONLY a JSON object, no other text: {"question": "...", "options": ["A","B","C","D"], "correctIndex": 0}`

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  })

  const text = response.choices[0]?.message?.content || "{}"
  const cleaned = text.replace(/```json|```/g, "").trim()

  try {
    const parsed = JSON.parse(cleaned)
    await prisma.dailyTrivia.create({
      data: { question: parsed.question, options: parsed.options, correctIndex: parsed.correctIndex, date: today },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to generate trivia" }, { status: 500 })
  }
}