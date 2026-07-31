"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Flame, Brain, ArrowRight } from "lucide-react"

type TriviaMeta = {
  trivia: { id: number; questions: { question: string; options: string[] }[] } | null
  alreadyAttempted: boolean
  previousScore: number | null
  streak: number
}

export function DailyTriviaCard() {
  const router = useRouter()
  const [data, setData] = useState<TriviaMeta | null>(null)

  useEffect(() => {
    fetch("/api/trivia/today").then((r) => r.json()).then(setData)
  }, [])

  if (!data || !data.trivia) return null

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-transparent px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/15 p-1.5">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Today's Quiz</p>
            <p className="text-[10px] text-muted-foreground">5 questions for your branch</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold text-[oklch(0.72_0.15_60)]">
          <Flame className="h-3.5 w-3.5" /> {data.streak}
        </span>
      </div>

      <div className="p-4">
        {data.alreadyAttempted ? (
          <div className="flex items-center justify-between">
            <p className="text-sm">You scored <span className="font-bold">{data.previousScore}/5</span> today</p>
            <Button size="sm" variant="outline" onClick={() => router.push("/quiz/leaderboard")}>
              Leaderboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        ) : (
          <Button size="sm" className="w-full" onClick={() => router.push("/quiz")}>
            Start Today's Quiz
          </Button>
        )}
      </div>
    </div>
  )
}