"use client"

import { useEffect, useState } from "react"
import { Flame, Brain, Trophy, Medal } from "lucide-react"

type TriviaData = {
  trivia: { id: number; question: string; options: string[] } | null
  alreadyAttempted: boolean
  wasCorrect: boolean | null
  streak: number
  bestStreak: number
}

type LeaderboardEntry = { rank: number; name: string; time: string }

const RANK_STYLES = [
  { emoji: "🥇", color: "text-yellow-500" },
  { emoji: "🥈", color: "text-gray-400" },
  { emoji: "🥉", color: "text-amber-600" },
]

export function DailyTriviaCard() {
  const [data, setData] = useState<TriviaData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<{ isCorrect: boolean; correctIndex: number; streak: number } | null>(null)

  async function load() {
    const res = await fetch("/api/trivia/today")
    const d = await res.json()
    setData(d)
    if (d.alreadyAttempted) loadLeaderboard()
  }

  async function loadLeaderboard() {
    const res = await fetch("/api/trivia/leaderboard")
    setLeaderboard(await res.json())
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
    loadLeaderboard()
  }

  if (!data || !data.trivia) return null

  const answered = data.alreadyAttempted || result !== null
  const correctIdx = result?.correctIndex

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* LinkedIn-jaisa header strip */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Daily Campus Trivia</p>
            <p className="text-[10px] text-muted-foreground">A new challenge every day</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-[oklch(0.72_0.15_60)]">
          <Flame className="h-3.5 w-3.5" /> {result?.streak ?? data.streak}
        </span>
      </div>

      <div className="p-4 space-y-3">
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
          <>
            <p className={`text-xs font-medium ${(result?.isCorrect ?? data.wasCorrect) ? "text-[oklch(var(--success))]" : "text-red-500"}`}>
              {(result?.isCorrect ?? data.wasCorrect) ? "Correct! Come back tomorrow 🎉" : "Not quite — try again tomorrow!"}
            </p>

            {leaderboard.length > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-primary" /> Today's Leaderboard
                </p>
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      {entry.rank <= 3 ? (
                        <span>{RANK_STYLES[entry.rank - 1].emoji}</span>
                      ) : (
                        <span className="w-4 text-center text-muted-foreground">{entry.rank}</span>
                      )}
                      {entry.name}
                    </span>
                    <span className="text-muted-foreground">{new Date(entry.time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}