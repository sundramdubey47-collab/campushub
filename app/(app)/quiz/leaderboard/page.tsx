"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, ArrowLeft } from "lucide-react"

type Entry = { rank: number; name: string; score: number; time: string }

const RANK_EMOJI: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
}

export default function QuizLeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trivia/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-md mx-auto space-y-5">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="text-center space-y-1">
        <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
        <h1 className="text-xl font-bold">Today's Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Ranked by correct answers, then speed
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center">
          Loading...
        </p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No one has played yet — be the first!
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  entry.rank <= 3
                    ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-sm">
                    {RANK_EMOJI[entry.rank] || entry.rank}
                  </span>

                  <span className="text-sm font-medium">{entry.name}</span>
                </div>

                <span className="text-xs font-semibold text-primary">
                  {entry.score}/5
                </span>
              </div>
            ))}
          </div>

          {/* Streak Reminder */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-4 text-center">
            <h3 className="font-semibold text-orange-700 dark:text-orange-300">
              🔥 Don't Break Your Streak!
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
             Come back tomorrow for a brand-new quiz. Keep your streak alive, earn more points, and stay at the top of the leaderboard! 🚀
            </p>
          </div>
        </>
      )}
    </div>
  )
}