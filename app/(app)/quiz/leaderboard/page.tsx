"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowLeft } from "lucide-react"

type Entry = { rank: number; name: string; isCorrect: boolean; time: string }

const RANK_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" }

export default function QuizLeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trivia/leaderboard").then((r) => r.json()).then((d) => {
      setEntries(d)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-md mx-auto space-y-5">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="text-center space-y-1">
        <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
        <h1 className="text-xl font-bold">Today's Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top scorers from your branch</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No one has played yet — be the first!</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                entry.rank <= 3 ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20" : "bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold">
                  {RANK_EMOJI[entry.rank] || entry.rank}
                </span>
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${entry.isCorrect ? "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]" : "bg-muted text-muted-foreground"}`}>
                {entry.isCorrect ? "Passed" : "Tried"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}