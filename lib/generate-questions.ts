import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateQuestions(topic: string, difficulty: string, count: number) {
  const prompt = `Tum ek expert exam-question-setter ho. Topic "${topic}" par ${count} multiple-choice questions banao, difficulty level "${difficulty}".

STRICT RULES:
- Sirf JSON array return karo, koi aur text nahi (koi preamble, koi markdown backticks nahi)
- Har question ka format ye ho:
{"questionText": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0}
- correctIndex 0 se 3 ke beech hona chahiye (kaunsa option sahi hai, uska index)
- Questions clear aur unambiguous hone chahiye

Ab ${count} questions ka JSON array do.`

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const text = response.choices[0]?.message?.content || "[]"
  const cleaned = text.replace(/```json|```/g, "").trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error("AI se sahi format me questions nahi mile, dobara try karo")
  }
}