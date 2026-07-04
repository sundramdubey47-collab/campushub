"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"
import { Autocomplete } from "@/components/autocomplete"

type Course = { id: number; name: string }
type Semester = { id: number; number: number }
type Subject = { id: number; name: string }

const CATEGORY_OPTIONS = [
  { value: "NOTES", label: "Notes" },
  { value: "ASSIGNMENT", label: "Assignment" },
  { value: "LAB_RECORD", label: "Lab Record" },
  { value: "PREVIOUS_YEAR_PAPER", label: "Previous Year Paper" },
  { value: "BOOK", label: "Book" },
  { value: "PRESENTATION", label: "Presentation" },
  { value: "PRACTICAL_FILE", label: "Practical File" },
  { value: "QUESTION_BANK", label: "Question Bank" },
  { value: "FACULTY_NOTES", label: "Faculty Notes" },
  { value: "VIVA_QUESTIONS", label: "Viva Questions" },
  { value: "PROJECT", label: "Project" },
  { value: "OTHERS", label: "Others" },
  { value: "SYLLABUS", label: "Syllabus" },
]

export default function UploadResourcePage() {
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [category, setCategory] = useState("")
  const [unit, setUnit] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/college-courses")
      .then((res) => res.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    if (!courseId) {
      setSemesters([])
      setSemesterId("")
      return
    }
    fetch(`/api/course-semesters?courseId=${courseId}`)
      .then((res) => res.json())
      .then(setSemesters)
  }, [courseId])

  useEffect(() => {
    if (!semesterId) {
      setSubjects([])
      setSubjectId("")
      return
    }
    fetch(`/api/subjects?semesterId=${semesterId}`)
      .then((res) => res.json())
      .then(setSubjects)
  }, [semesterId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!file || !title || !courseId || !semesterId) {
      setError("Title, Branch, Semester aur File zaroori hai")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("file", file)
    formData.append("courseId", courseId)
    formData.append("semesterId", semesterId)
    formData.append("subjectId", subjectId)
    formData.append("category", category)
    formData.append("unit", unit)

    const res = await fetch("/api/notes/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/notes")
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Academic Resource Upload Karo</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

<div className="space-y-2">
  <Label>Branch</Label>
  <Autocomplete
    placeholder="Branch type karo..."
    value={courseId}
    onChange={setCourseId}
    options={courses.map((c) => ({ value: c.id.toString(), label: c.name }))}
  />
</div>

      <div className="space-y-2">
  <Label>Semester</Label>
  <Autocomplete
    placeholder="Semester type karo..."
    value={semesterId}
    onChange={setSemesterId}
    options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
    disabled={!courseId}
  />
</div>

       <div className="space-y-2">
  <Label>Subject / Unit</Label>
  <Autocomplete
    placeholder="Subject type karo..."
    value={subjectId}
    onChange={setSubjectId}
    options={subjects.map((s) => ({ value: s.id.toString(), label: s.name }))}
    disabled={!semesterId}
  />
  <Input
    placeholder="Unit/Chapter (optional) — jaise: Unit 2"
    value={unit}
    onChange={(e) => setUnit(e.target.value)}
  />
</div>

        <div className="space-y-2">
          <Label>Resource Type</Label>
          <Combobox
            placeholder="Resource type chuno..."
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS}
          />
        </div>

        <div className="space-y-2">
          <Label>File (PDF/Image)</Label>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Upload ho raha hai..." : "Upload Karo"}
        </Button>
      </form>
    </div>
  )
}