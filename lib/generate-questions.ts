
type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type Question = {
  questionText: string
  options: string[]
  correctIndex: number
}

type Provider = {
  name: string
  run: () => Promise<string>
}

async function readResponse(response: Response): Promise<any> {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${
        data?.error?.message ||
        data?.message ||
        response.statusText
      }`
    )
  }

  return data
}

// 1. Gemini
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) throw new Error("GEMINI_API_KEY missing")

  const model =
    process.env.GEMINI_MODEL || "gemini-2.5-flash"

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    }
  )

  const data = await readResponse(response)

  const answer = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim()

  if (!answer) throw new Error("Gemini returned empty response")

  return answer
}

// 2. Groq
async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) throw new Error("GROQ_API_KEY missing")

  const model =
    process.env.GROQ_MODEL || "openai/gpt-oss-20b"

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_object",
        },
      }),
      cache: "no-store",
    }
  )

  const data = await readResponse(response)

  const answer = data?.choices?.[0]?.message?.content?.trim()

  if (!answer) throw new Error("Groq returned empty response")

  return answer
}

// 3. OpenRouter
async function callOpenRouter(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing")

  const model =
    process.env.OPENROUTER_MODEL || "openrouter/free"

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "CampusHub",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_object",
        },
      }),
      cache: "no-store",
    }
  )

  const data = await readResponse(response)

  const answer = data?.choices?.[0]?.message?.content?.trim()

  if (!answer) throw new Error("OpenRouter returned empty response")

  return answer
}

// Main question generation with automatic fallback
export async function generateQuestions(
  topic: string,
  difficulty: string,
  count: number
): Promise<Question[]> {

  if (!topic.trim()) {
    throw new Error("Topic is required")
  }

  if (!Number.isInteger(count) || count < 1 || count > 50) {
    throw new Error("Question count must be between 1 and 50")
  }

  const prompt = `
Tum ek expert exam-question-setter ho.

Topic: "${topic}"
Difficulty: "${difficulty}"
Number of questions: ${count}

STRICT RULES:

1. Exactly ${count} multiple-choice questions banao.
2. Sirf valid JSON return karo.
3. Har question me exactly 4 options hone chahiye.
4. correctIndex 0 se 3 ke beech hona chahiye.
5. Questions clear aur unambiguous hone chahiye.
6. Correct answer factually accurate hona chahiye.
7. Questions repeat nahi hone chahiye.
8. Markdown ya code fences use mat karna.

Required JSON format:

{
  "questions": [
    {
      "questionText": "Question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

Exactly ${count} questions generate karo.
`

  const providers: Provider[] = [
    {
      name: "Gemini",
      run: () => callGemini(prompt),
    },
    {
      name: "Groq",
      run: () => callGroq(prompt),
    },
    {
      name: "OpenRouter",
      run: () => callOpenRouter(prompt),
    },
  ]

  const errors: string[] = []

  for (const provider of providers) {
    try {
      console.log(`[CampusHub Quiz] Trying ${provider.name}...`)

      const response = await provider.run()

      const cleaned = response
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()

      const parsed = JSON.parse(cleaned)

      const questions = Array.isArray(parsed)
        ? parsed
        : parsed.questions

      if (!Array.isArray(questions)) {
        throw new Error("Invalid questions JSON format")
      }

      if (questions.length !== count) {
        throw new Error(
          `Expected ${count} questions, received ${questions.length}`
        )
      }

      const valid = questions.every((q: any) =>
        typeof q.questionText === "string" &&
        q.questionText.trim().length > 0 &&
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

      if (!valid) {
        throw new Error("Invalid question structure")
      }

      console.log(
        `[CampusHub Quiz] Success: ${provider.name}`
      )

      return questions
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error)

      console.error(
        `[CampusHub Quiz] ${provider.name} failed:`,
        message
      )

      errors.push(`${provider.name}: ${message}`)
    }
  }

  console.error("[CampusHub Quiz] All providers failed:", errors)

  throw new Error(
    "AI question generation is temporarily unavailable. Please try again later."
  )
}
