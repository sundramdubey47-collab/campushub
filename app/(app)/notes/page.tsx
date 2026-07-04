"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Autocomplete } from "@/components/autocomplete"
import { Combobox } from "@/components/combobox"

type Option = { id: number; name?: string; number?: number }

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
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "OTHERS", label: "Others" },
]

type Note = {
  id: number
  title: string
  description: string | null
  fileUrl: string
  isPremium: boolean
  createdAt: string
  category: string
  unit: string | null
  views: number
  downloads: number
  uploadedBy: { name: string; college: { name: string } | null }
  university: { name: string }
  course: { name: string }
  semester: { number: number }
  subject: { name: string } | null
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const [universities, setUniversities] = useState<Option[]>([])
  const [colleges, setColleges] = useState<Option[]>([])
  const [courses, setCourses] = useState<Option[]>([])
  const [semesters, setSemesters] = useState<Option[]>([])
  const [subjects, setSubjects] = useState<Option[]>([])

  const [universityId, setUniversityId] = useState("")
  const [collegeId, setCollegeId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    fetch("/api/universities").then((r) => r.json()).then(setUniversities)
  }, [])

  useEffect(() => {
    if (!universityId) { setColleges([]); setCollegeId(""); return }
    fetch(`/api/colleges?universityId=${universityId}`).then((r) => r.json()).then(setColleges)
  }, [universityId])

  useEffect(() => {
    if (!collegeId) { setCourses([]); setCourseId(""); return }
    fetch(`/api/college-courses-by-id?collegeId=${collegeId}`).then((r) => r.json()).then(setCourses)
  }, [collegeId])

  useEffect(() => {
    if (!courseId) { setSemesters([]); setSemesterId(""); return }
    fetch(`/api/course-semesters?courseId=${courseId}`).then((r) => r.json()).then(setSemesters)
  }, [courseId])

  useEffect(() => {
    if (!semesterId) { setSubjects([]); setSubjectId(""); return }
    fetch(`/api/subjects?semesterId=${semesterId}`).then((r) => r.json()).then(setSubjects)
  }, [semesterId])

  async function search() {
    setLoading(true)
    const params = new URLSearchParams()
    if (universityId) params.set("universityId", universityId)
    if (collegeId) params.set("collegeId", collegeId)
    if (courseId) params.set("courseId", courseId)
    if (semesterId) params.set("semesterId", semesterId)
    if (subjectId) params.set("subjectId", subjectId)
    if (category) params.set("category", category)

    const res = await fetch(`/api/notes?${params.toString()}`)
    const data = await res.json()
    setNotes(data)
    setLoading(false)
  }

  useEffect(() => {
    search()
  }, [])
async function handleDownload(noteId: number, fileUrl: string) {
  const res = await fetch(`/api/notes/${noteId}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "download" }),
  })

  if (res.status === 403) {
    const data = await res.json()
    alert(data.message)
    return
  }

  window.open(fileUrl, "_blank")
}
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Resources</h1>
        <Link href="/notes/upload">
          <Button>Upload Resource</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Autocomplete
          placeholder="University"
          value={universityId}
          onChange={setUniversityId}
          options={universities.map((u) => ({ value: u.id.toString(), label: u.name! }))}
        />
        <Autocomplete
          placeholder="College"
          value={collegeId}
          onChange={setCollegeId}
          options={colleges.map((c) => ({ value: c.id.toString(), label: c.name! }))}
          disabled={!universityId}
        />
        <Autocomplete
          placeholder="Branch"
          value={courseId}
          onChange={setCourseId}
          options={courses.map((c) => ({ value: c.id.toString(), label: c.name! }))}
          disabled={!collegeId}
        />
        <Autocomplete
          placeholder="Semester"
          value={semesterId}
          onChange={setSemesterId}
          options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
          disabled={!courseId}
        />
        <Autocomplete
          placeholder="Subject"
          value={subjectId}
          onChange={setSubjectId}
          options={subjects.map((s) => ({ value: s.id.toString(), label: s.name! }))}
          disabled={!semesterId}
        />
        <Combobox
          placeholder="Resource Type"
          value={category}
          onChange={setCategory}
          options={CATEGORY_OPTIONS}
        />
      </div>

      <Button onClick={search}>Search</Button>

      {loading ? (
        <p className="text-muted-foreground">Load ho raha hai...</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground">Koi resource nahi mila</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border rounded-lg p-4 space-y-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => router.push(`/notes/${note.id}`)}
            >
              <div className="flex items-start justify-between">
                <h2 className="font-semibold">{note.title}</h2>
                {note.isPremium ? (
                  <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                    Premium
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-muted px-2 py-1 rounded">{note.category}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">{note.course.name}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">Sem {note.semester.number}</span>
                {note.subject ? (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{note.subject.name}</span>
                ) : null}
                {note.unit ? (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{note.unit}</span>
                ) : null}
              </div>

              {note.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{note.description}</p>
              ) : null}

              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>By {note.uploadedBy.name} — {note.uploadedBy.college?.name ?? "N/A"}</p>
                <p>{note.university.name}</p>
                <p>{new Date(note.createdAt).toLocaleDateString()}</p>
                <p>{note.views} views • {note.downloads} downloads</p>
              </div>
<button
  onClick={(e) => {
    e.stopPropagation()
    handleDownload(note.id, note.fileUrl)
  }}
  className="text-sm text-primary underline"
>
  Preview / Download
</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}