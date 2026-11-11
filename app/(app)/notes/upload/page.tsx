"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"
import { Autocomplete } from "@/components/autocomplete"
import { uploadToCloudinary, MAX_DIRECT_UPLOAD_BYTES } from "@/lib/direct-upload"
import { resizeKeepAspect } from "@/lib/image-utils"

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

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]
const PREMIUM_ENABLED = process.env.NEXT_PUBLIC_PREMIUM_ENABLED === "true"

function UploadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [openRequests, setOpenRequests] = useState<{ id: number; title: string }[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [category, setCategory] = useState("")
  const [isPremium, setIsPremium] = useState(false)
  const [unit, setUnit] = useState("")
  const [fulfillsRequestId, setFulfillsRequestId] = useState(searchParams.get("requestId") || "")

  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/college-courses")
      .then((res) => res.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    fetch("/api/resource-requests")
      .then((r) => r.json())
      .then((data) => setOpenRequests(data.filter((r: any) => r.status === "OPEN")))
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("")
    const picked = e.target.files?.[0] ?? null
    if (!picked) {
      setFile(null)
      return
    }

    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError("Sirf PDF, JPG ya PNG file upload ho sakti hai")
      e.target.value = ""
      setFile(null)
      return
    }
    setFile(picked)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!file || !title.trim() || !courseId || !semesterId) {
      setError("Title, Branch, Semester and File are required")
      return
    }

    setLoading(true)

    try {
      // Photo hai to pehle halki kar do (PDF ko chhedte nahi)
      const toUpload = file.type.startsWith("image/") ? await resizeKeepAspect(file) : file

      if (toUpload.size > MAX_DIRECT_UPLOAD_BYTES) {
        throw new Error("File 10 MB se badi hai. Chhoti karke dobara try karo (PDF ke liye 'compress PDF' site use karo).")
      }

      setStage("uploading")
      setProgress(0)
      const fileUrl = await uploadToCloudinary(toUpload, "campushub-notes", setProgress)

      setStage("saving")
      const res = await fetch("/api/notes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileUrl,
          courseId,
          semesterId,
          subjectId: subjectId || null,
          category,
          unit,
          isPremium: PREMIUM_ENABLED ? isPremium : false,
          fulfillsRequestId: fulfillsRequestId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not save your upload")

      router.push("/notes")
    } catch (err: any) {
      setError(err?.message || "Upload failed. Please try again.")
      setLoading(false)
      setStage("idle")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Upload Academic Resource</h1>
            <p className="text-sm text-blue-100 sm:text-base">
              Share your notes, assignments, papers and study materials with CampusHub students.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">📚 Notes</span>
              <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">🎓 Academic</span>
              <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">🚀 CampusHub</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border bg-white p-5 shadow-xl sm:p-8">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-2">
            <Label className="font-semibold">Resource Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Data Structure Unit 1 Notes"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your resource..."
              className="min-h-[120px] resize-none rounded-xl"
            />
          </div>

          <div className="space-y-5 rounded-2xl border bg-slate-50 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800">📖 Academic Information</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-medium">Branch</Label>
                <Autocomplete
                  placeholder="Select Branch"
                  value={courseId}
                  onChange={setCourseId}
                  options={courses.map((c) => ({ value: c.id.toString(), label: c.name }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Semester</Label>
                <Autocomplete
                  placeholder="Select Semester"
                  value={semesterId}
                  onChange={setSemesterId}
                  options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
                  disabled={!courseId}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Subject / Unit</Label>
              <Autocomplete
                placeholder="Select Subject"
                value={subjectId}
                onChange={setSubjectId}
                options={subjects.map((s) => ({ value: s.id.toString(), label: s.name }))}
                disabled={!semesterId}
              />
              <Input
                placeholder="Unit / Chapter (Example: Unit 2)"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-3 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-white p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800">📂 Resource Category</h2>
            <Combobox placeholder="Select Resource Type" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
          </div>

          {openRequests.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-800">🙋 Fulfilling a Request?</h2>
              <p className="text-xs text-slate-600">
                If someone requested this resource, select it below. They'll be notified instantly.
              </p>
              <Combobox
                placeholder="Select a request (optional)"
                value={fulfillsRequestId}
                onChange={setFulfillsRequestId}
                options={openRequests.map((r) => ({ value: r.id.toString(), label: r.title }))}
              />
            </div>
          )}

          {PREMIUM_ENABLED && (
            <div className="rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="mt-1 h-5 w-5 cursor-pointer accent-yellow-500"
                />
                <div>
                  <Label htmlFor="isPremium" className="cursor-pointer font-semibold text-slate-800">
                    ⭐ Mark as Premium Resource
                  </Label>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                    Only Premium members will be able to access this resource.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 sm:p-6">
            <div className="mb-3 text-center">
              <div className="text-4xl">📄</div>
              <h3 className="mt-2 font-semibold text-slate-800">Upload PDF / Image</h3>
              <p className="text-sm text-slate-500">PDF, JPG, PNG • max 10 MB</p>
            </div>

            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={loading}
              className="cursor-pointer rounded-xl bg-white"
            />

            {file && (
              <p className="mt-2 truncate text-center text-xs text-slate-600">
                {file.name} • {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}

            {stage === "uploading" && (
              <div className="mt-4 space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-center text-xs text-slate-600">Uploading... {progress}%</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            {stage === "uploading" ? `Uploading ${progress}%` : stage === "saving" ? "Saving..." : "🚀 Upload Resource"}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-center text-white shadow-lg">
          <p className="text-sm font-medium">CampusHub Community Sharing</p>
          <p className="mt-1 text-xs text-slate-300">Help thousands of students by sharing quality resources.</p>
        </div>
      </div>
    </div>
  )
}

export default function UploadResourcePage() {
  return (
    <Suspense fallback={null}>
      <UploadForm />
    </Suspense>
  )
}