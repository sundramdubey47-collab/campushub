"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

type Question = { question: string; options: string[] }

export default function QuizPage() {
  const router = useRouter()
  const [triviaId, setTriviaId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  useEffect(() => {
    fetch("/api/trivia/today")
      .then((r) => r.json())
      .then((data) => {
        if (!data.trivia) {
          router.push("/dashboard")
          return
        }
        if (data.alreadyAttempted) {
          setAlreadyDone(true)
          setLoading(false)
          return
        }
        setTriviaId(data.trivia.id)
        setQuestions(data.trivia.questions)
        setLoading(false)
      })
  }, [router])

  function selectAnswer(optionIndex: number) {
    const newAnswers = [...answers]
    newAnswers[currentIndex] = optionIndex
    setAnswers(newAnswers)
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      await handleSubmit()
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch("/api/trivia/today", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triviaId, answers }),
    })
    await res.json()
    setSubmitting(false)
    router.push("/quiz/leaderboard")
  }

  if (loading) return <p className="text-muted-foreground">Loading quiz...</p>

  if (alreadyDone) {
    return (
      <div className="max-w-md mx-auto text-center space-y-3 pt-10">
        <Brain className="h-10 w-10 text-primary mx-auto" />
        <p className="font-semibold">You've already played today's quiz!</p>
        <Button onClick={() => router.push("/quiz/leaderboard")}>View Leaderboard</Button>
      </div>
    )
  }

  const q = questions[currentIndex]

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Question {currentIndex + 1} of {questions.length}</p>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full ${i <= currentIndex ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <p className="font-semibold">{q.question}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left text-sm p-3 rounded-lg border transition-colors ${
                answers[currentIndex] === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={handleNext} disabled={answers[currentIndex] === undefined || submitting}>
        {submitting ? "Submitting..." : currentIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
      </Button>
    </div>
  )
}