/*import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function getAIResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  // Abhi Groq (Llama model) use ho raha hai — free aur fast.
  // Future me yahan sirf ye function badal kar Anthropic/OpenAI/Gemini switch kiya ja sakta hai,
  // baaki poora app isी function ko call karta hai, isliye kahin aur badlav nahi karna padega.

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  })

  return response.choices[0]?.message?.content || "Maaf karo, response nahi mil paya."
}*/


type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type Provider = {
  name: string
  run: () => Promise<string>
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
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

// 1. Gemini provider
async function callGemini(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) throw new Error("GEMINI_API_KEY missing")

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash"

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
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

  if (!answer) {
    throw new Error("Gemini returned an empty response")
  }

  return answer
}

// 2. Groq provider
async function callGroq(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
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
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
      cache: "no-store",
    }
  )

  const data = await readResponse(response)

  const answer = data?.choices?.[0]?.message?.content?.trim()

  if (!answer) {
    throw new Error("Groq returned an empty response")
  }

  return answer
}

// 3. OpenRouter provider
async function callOpenRouter(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
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
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
      cache: "no-store",
    }
  )

  const data = await readResponse(response)

  const answer = data?.choices?.[0]?.message?.content?.trim()

  if (!answer) {
    throw new Error("OpenRouter returned an empty response")
  }

  return answer
}

// Main AI function with automatic fallback
export async function getAIResponse(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const providers: Provider[] = [
    {
      name: "Gemini",
      run: () => callGemini(messages, systemPrompt),
    },
    {
      name: "Groq",
      run: () => callGroq(messages, systemPrompt),
    },
    {
      name: "OpenRouter",
      run: () => callOpenRouter(messages, systemPrompt),
    },
  ]

  const errors: string[] = []

  for (const provider of providers) {
    try {
      console.log(`[CampusHub AI] Trying ${provider.name}...`)

      const answer = await provider.run()

      console.log(
        `[CampusHub AI] Success: ${provider.name}`
      )

      return answer
    } catch (error) {
      const errorMessage = getErrorMessage(error)

      console.error(
        `[CampusHub AI] ${provider.name} failed:`,
        errorMessage
      )

      errors.push(`${provider.name}: ${errorMessage}`)
    }
  }

  console.error(
    "[CampusHub AI] All providers failed:",
    errors
  )

  throw new Error(
    "CampusHub AI is temporarily unavailable. Please try again later."
  )
}
