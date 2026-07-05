"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Trophy } from "lucide-react"

type Attempt = {
  id: number
  score: number
  totalQuestions: number
  submittedAt: string
  user: { name: string }
}

export default function LeaderboardPage() {
  const params = useParams()
  const testId = params.id
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/tests/${testId}/leaderboard`)
      .then((r) => r.json())
      .then((data) => {
        setAttempts(data)
        setLoading(false)
      })
  }, [testId])

  if (loading) return <p className="text-muted-foreground">Load ho raha hai...</p>

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
      </h1>

      {attempts.length === 0 ? (
        <p className="text-muted-foreground">Abhi tak koi attempt nahi hai</p>
      ) : (
        <div className="space-y-2">
          {attempts.map((a, index) => (
            <div key={a.id} className="border rounded-lg p-3 flex items-center gap-3">
              <span className="font-bold w-6">{index + 1}</span>
              <span className="flex-1">{a.user.name}</span>
              <span className="font-bold">{a.score} / {a.totalQuestions}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}