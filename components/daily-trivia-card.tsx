"use client"

import { useEffect, useState } from "react"
import { Flame, Brain } from "lucide-react"

type TriviaData = {
  trivia: { id: number; question: string; options: string[] } | null
  alreadyAttempted: boolean
  wasCorrect: boolean | null
  streak: number
  bestStreak: number
}

export function DailyTriviaCard() {
  const [data, setData] = useState<TriviaData | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
const [result, setResult] = useState<{
  isCorrect: boolean
  correctIndex: number
  streak: number
  bestStreak: number
} | null>(null)

  async function load() {
    const res = await fetch("/api/trivia/today")
    const d = await res.json()
    setData(d)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAnswer(index: number) {
    if (!data?.trivia || data.alreadyAttempted) return
    setSelected(index)

    const res = await fetch("/api/trivia/today", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triviaId: data.trivia.id, selectedIndex: index }),
    })
    const d = await res.json()
    setResult(d)
  }

  if (!data || !data.trivia) return null

  const answered = data.alreadyAttempted || result !== null
  const correctIdx = result?.correctIndex

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" /> Daily Trivia
        </h2>
        <span className="flex items-center gap-1 text-xs font-bold text-[oklch(0.72_0.15_60)]">
          <Flame className="h-3.5 w-3.5" /> {result?.streak ?? data.streak} day streak
        </span>
      </div>

      <p className="text-sm font-medium">{data.trivia.question}</p>

      <div className="space-y-1.5">
        {data.trivia.options.map((opt, i) => {
          let style = "border-border"
          if (answered) {
            if (i === correctIdx) style = "border-[oklch(var(--success))] bg-[oklch(var(--success)/0.1)]"
            else if (i === selected && !result?.isCorrect) style = "border-red-400 bg-red-50 dark:bg-red-950/20"
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full text-left text-xs p-2.5 rounded-lg border transition-colors ${style} ${!answered ? "hover:border-primary" : ""}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <p className={`text-xs font-medium ${(result?.isCorrect ?? data.wasCorrect) ? "text-[oklch(var(--success))]" : "text-red-500"}`}>
          {(result?.isCorrect ?? data.wasCorrect) ? "Correct! Come back tomorrow 🎉" : "Not quite — try again tomorrow!"}
        </p>
      )}
    </div>
  )
}