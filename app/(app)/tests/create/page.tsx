"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/autocomplete"
import { Combobox } from "@/components/combobox"

type Option = { id: number; name?: string; number?: number }

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
]

export default function CreateTestPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Option[]>([])
  const [semesters, setSemesters] = useState<Option[]>([])
  const [subjects, setSubjects] = useState<Option[]>([])

  const [title, setTitle] = useState("")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [durationMinutes, setDurationMinutes] = useState("30")
  const [negativeMarking, setNegativeMarking] = useState("0")
  const [questionCount, setQuestionCount] = useState("10")
  const [isPremium, setIsPremium] = useState(false)
  const [price, setPrice] = useState("")

  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")
  const [subjectId, setSubjectId] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/college-courses").then((r) => r.json()).then(setCourses)
  }, [])

  useEffect(() => {
    if (!courseId) { setSemesters([]); setSemesterId(""); return }
    fetch(`/api/course-semesters?courseId=${courseId}`).then((r) => r.json()).then(setSemesters)
  }, [courseId])

  useEffect(() => {
    if (!semesterId) { setSubjects([]); setSubjectId(""); return }
    fetch(`/api/subjects?semesterId=${semesterId}`).then((r) => r.json()).then(setSubjects)
  }, [semesterId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title || !topic || !courseId || !semesterId) {
      setError("Title, Topic, Branch aur Semester zaroori hai")
      return
    }

    setLoading(true)

    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, topic, difficulty,
        durationMinutes: Number(durationMinutes),
        negativeMarking: Number(negativeMarking),
        questionCount: Number(questionCount),
        isPremium, price: isPremium ? Number(price) : null,
        courseId, semesterId, subjectId: subjectId || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/tests")
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">AI Test Banao</h1>
      <p className="text-sm text-muted-foreground">AI topic ke hisaab se questions khud generate karega</p>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          <Label>Test Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Topic (AI isी par questions banayega)</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Jaise: Data Structures - Linked Lists" required />
        </div>

        <div className="space-y-2">
          <Label>Branch</Label>
          <Autocomplete placeholder="Branch chuno..." value={courseId} onChange={setCourseId}
            options={courses.map((c) => ({ value: c.id.toString(), label: c.name! }))} />
        </div>

        <div className="space-y-2">
          <Label>Semester</Label>
          <Autocomplete placeholder="Semester chuno..." value={semesterId} onChange={setSemesterId}
            options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
            disabled={!courseId} />
        </div>

        <div className="space-y-2">
          <Label>Subject (optional)</Label>
          <Autocomplete placeholder="Subject chuno..." value={subjectId} onChange={setSubjectId}
            options={subjects.map((s) => ({ value: s.id.toString(), label: s.name! }))}
            disabled={!semesterId} />
        </div>

        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Combobox placeholder="Difficulty chuno..." value={difficulty} onChange={setDifficulty} options={DIFFICULTY_OPTIONS} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Negative Marking</Label>
            <Input type="number" step="0.25" value={negativeMarking} onChange={(e) => setNegativeMarking(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Questions</Label>
            <Input type="number" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          <Label>Ye Paid Test hai</Label>
        </div>

        {isPremium && (
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "AI questions generate kar raha hai..." : "Test Banao"}
        </Button>
      </form>
    </div>
  )
}