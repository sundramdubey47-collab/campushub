"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Question = {
  id: number
  questionText: string
  options: string[]
}

export default function TakeTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id

  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; totalQuestions: number } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function startTest() {
      const res = await fetch(`/api/tests/${testId}/attempt`, { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      setAttemptId(data.attemptId)
      setQuestions(data.questions)
      setSecondsLeft(data.durationMinutes * 60)
      setLoading(false)
    }
    startTest()
  }, [testId])

  useEffect(() => {
    if (loading || result || secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleSubmit()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [loading, result, secondsLeft])

  function selectAnswer(questionId: number, index: number) {
    setAnswers({ ...answers, [questionId]: index })
  }

  async function handleSubmit() {
    if (submitting || !attemptId) return
    setSubmitting(true)

    const answerList = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? null,
    }))

    const res = await fetch(`/api/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerList }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setResult(data)
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (error) return <p className="text-red-500">{error}</p>
  if (loading) return <p className="text-muted-foreground">Test load ho raha hai...</p>

  if (result) {
    return (
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold">Test Submit Ho Gaya! 🎉</h1>
        <p className="text-4xl font-bold">{result.score} / {result.totalQuestions}</p>
        <Button onClick={() => router.push(`/tests/${testId}/leaderboard`)}>Leaderboard Dekho</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-background py-2 border-b">
        <h1 className="text-xl font-bold">Test De Rahe Ho</h1>
        <span className={`text-lg font-mono ${secondsLeft < 60 ? "text-red-500" : ""}`}>
          ⏱ {formatTime(secondsLeft)}
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="border rounded-lg p-4 space-y-3">
            <p className="font-medium">{index + 1}. {q.questionText}</p>
            <div className="space-y-2">
              {q.options.map((option, optIndex) => (
                <label
                  key={optIndex}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${
                    answers[q.id] === optIndex ? "border-primary bg-muted" : "border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === optIndex}
                    onChange={() => selectAnswer(q.id, optIndex)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submit ho raha hai..." : "Test Submit Karo"}
      </Button>
    </div>
  )
}