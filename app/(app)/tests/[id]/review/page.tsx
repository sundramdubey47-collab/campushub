"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Check } from "lucide-react"

type Q = { id: number; questionText: string; options: string[]; correctIndex: number }
type TestData = { id: number; title: string; topic: string; isPublished: boolean; questions: Q[] }

function QuestionEditor({ q, index, onDeleted }: { q: Q; index: number; onDeleted: (id: number) => void }) {
  const [text, setText] = useState(q.questionText)
  const [options, setOptions] = useState<string[]>(q.options)
  const [correct, setCorrect] = useState(q.correctIndex)
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle")
  const [err, setErr] = useState("")

  async function save() {
    setErr("")
    setState("saving")
    const res = await fetch(`/api/tests/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText: text, options, correctIndex: correct }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setErr(data.error || "Could not save")
      setState("idle")
      return
    }
    setState("saved")
    setTimeout(() => setState("idle"), 1500)
  }

  async function remove() {
    if (!confirm("Is question ko delete karna hai?")) return
    const res = await fetch(`/api/tests/questions/${q.id}`, { method: "DELETE" })
    if (res.ok) onDeleted(q.id)
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Question {index + 1}</p>
        <button type="button" onClick={remove} className="text-red-500" aria-label="Delete question">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} />

      <div className="space-y-2">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-2">
            <input type="radio" name={`correct-${q.id}`} checked={correct === i} onChange={() => setCorrect(i)} />
            <Input
              value={opt}
              onChange={(e) => setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))}
              className={correct === i ? "border-[oklch(var(--success))]" : ""}
            />
          </label>
        ))}
        <p className="text-[11px] text-muted-foreground">Sahi jawab ke saamne wala radio button chuno.</p>
      </div>

      {err && <p className="text-xs text-red-500">{err}</p>}

      <Button size="sm" variant="outline" onClick={save} disabled={state === "saving"}>
        {state === "saved" ? (
          <>
            <Check className="mr-1 h-3.5 w-3.5" /> Saved
          </>
        ) : state === "saving" ? (
          "Saving..."
        ) : (
          "Save changes"
        )}
      </Button>
    </div>
  )
}

export default function TestReviewPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string

  const [test, setTest] = useState<TestData | null>(null)
  const [loadError, setLoadError] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    const res = await fetch(`/api/tests/${testId}/review`, { cache: "no-store" })
    const data = await res.json()
    if (!res.ok) {
      setLoadError(data.error || "Could not load this test")
      return
    }
    setTest(data)
  }, [testId])

  useEffect(() => {
    load()
  }, [load])

  async function publish() {
    setMessage("")
    setPublishing(true)
    const res = await fetch(`/api/tests/${testId}/review`, { method: "POST" })
    const data = await res.json()
    setPublishing(false)

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }
    router.push("/tests")
  }

  if (loadError) return <p className="text-sm text-red-500">{loadError}</p>
  if (!test) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {test.isPublished ? "Published test" : "Draft. Students ko abhi nahi dikh raha"}
        </p>
        <h1 className="text-xl font-bold">{test.title}</h1>
        <p className="text-sm text-muted-foreground">{test.topic}</p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs leading-relaxed">
        AI se bane questions me kabhi-kabhi galat answer hota hai. Har question padho, sahi jawab verify karo, galat ya
        bekar question delete karo, phir Publish karo.
      </div>

      {message && <p className="text-sm">{message}</p>}

      <div className="space-y-3">
        {test.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            q={q}
            index={i}
            onDeleted={(id) => setTest((prev) => (prev ? { ...prev, questions: prev.questions.filter((x) => x.id !== id) } : prev))}
          />
        ))}
      </div>

      {!test.isPublished && (
        <Button className="w-full" onClick={publish} disabled={publishing || test.questions.length < 3}>
          {publishing ? "Publishing..." : `Publish test (${test.questions.length} questions)`}
        </Button>
      )}
    </div>
  )
}