"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Autocomplete } from "@/components/autocomplete"
import { Combobox } from "@/components/combobox"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Upload, SlidersHorizontal, X } from "lucide-react"

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
  const [showFilters, setShowFilters] = useState(false)

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

  function clearFilters() {
    setUniversityId("")
    setCollegeId("")
    setCourseId("")
    setSemesterId("")
    setSubjectId("")
    setCategory("")
  }

  const activeFilterCount = [universityId, collegeId, courseId, semesterId, subjectId, category].filter(Boolean).length

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
    <div className="space-y-5">
      <PageHeader
        title="Academic Resources"
        description="Notes, PYQs, assignments ,Lab record, Syllabus, Books/PDFs, Question Bank , Practices Sets, Importanat Questions"
        action={
          <Link href="/notes/upload">
            <Button size="sm">
              <Upload className="h-4 w-4 mr-1.5" /> Upload
            </Button>
          </Link>
        }
      />

      {/* Mobile: filter toggle button */}
      <div className="sm:hidden">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="w-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      <div className={`${showFilters ? "block" : "hidden"} sm:block space-y-2`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <Autocomplete placeholder="University" value={universityId} onChange={setUniversityId}
            options={universities.map((u) => ({ value: u.id.toString(), label: u.name! }))} />
          <Autocomplete placeholder="College" value={collegeId} onChange={setCollegeId}
            options={colleges.map((c) => ({ value: c.id.toString(), label: c.name! }))} disabled={!universityId} />
          <Autocomplete placeholder="Branch" value={courseId} onChange={setCourseId}
            options={courses.map((c) => ({ value: c.id.toString(), label: c.name! }))} disabled={!collegeId} />
          <Autocomplete placeholder="Semester" value={semesterId} onChange={setSemesterId}
            options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))} disabled={!courseId} />
          <Autocomplete placeholder="Subject" value={subjectId} onChange={setSubjectId}
            options={subjects.map((s) => ({ value: s.id.toString(), label: s.name! }))} disabled={!semesterId} />
          <Combobox placeholder="Resource Type" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={search}>Search</Button>
          {activeFilterCount > 0 && (
            <Button size="sm" variant="ghost" onClick={() => { clearFilters(); search() }}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No matching resource"
          description="Try changing thr filters, or uplode your own resources frist (To Connect your juniors)"
          action={
            <Link href="/notes/upload">
              <Button size="sm"><Upload className="h-4 w-4 mr-1.5" /> Upload</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              className="ch-notebook-line rounded-xl border bg-card p-4 space-y-2 cursor-pointer hover:border-primary hover:shadow-sm transition-all"
              onClick={() => router.push(`/notes/${note.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-sm leading-tight">{note.title}</h2>
                {note.isPremium && (
                  <span className="shrink-0 text-[10px] bg-[oklch(var(--premium)/0.15)] text-[oklch(var(--premium))] px-2 py-0.5 rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{note.category.replace(/_/g, " ")}</span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{note.course.name}</span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">Sem {note.semester.number}</span>
                {note.subject && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{note.subject.name}</span>}
              </div>

              {note.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{note.description}</p>
              )}

              <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 border-t">
                <p className="truncate">{note.uploadedBy.name} • {note.uploadedBy.college?.name ?? "N/A"}</p>
                <p>{note.views} views • {note.downloads} downloads</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(note.id, note.fileUrl)
                }}
                className="text-xs text-primary font-medium underline underline-offset-2"
              >
                Preview / Download
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}