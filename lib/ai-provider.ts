import Groq from "groq-sdk"

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
}