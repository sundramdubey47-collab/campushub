"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Autocomplete } from "@/components/autocomplete"

import {
  Bell,
  FileText,
  Paperclip,
  Building2,
  GraduationCap,
  Send,
} from "lucide-react"

type Option = {
  id: number
  name?: string
  number?: number
}

export default function CreateNoticePage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [departments, setDepartments] = useState<Option[]>([])
  const [courses, setCourses] = useState<Option[]>([])
  const [semesters, setSemesters] = useState<Option[]>([])

  const [departmentId, setDepartmentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")

  useEffect(() => {
    fetch("/api/my-college-departments")
      .then((res) => res.json())
      .then(setDepartments)
  }, [])

  useEffect(() => {
    if (!departmentId) {
      setCourses([])
      setCourseId("")
      return
    }

    fetch(`/api/department-courses?departmentId=${departmentId}`)
      .then((res) => res.json())
      .then(setCourses)
  }, [departmentId])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    let attachmentUrl = null

    if (file) {
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/notices/upload-attachment", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        setError(uploadData.error)
        setLoading(false)
        return
      }

      attachmentUrl = uploadData.url
    }

    const res = await fetch("/api/notices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        attachmentUrl,
        departmentId: departmentId || null,
        courseId: courseId || null,
        semesterId: semesterId || null,
      }),
    })

    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/notices")
  }

  return (
    <div className="mx-auto max-w-3xl py-8">

  {/* Header */}
  <div className="mb-8 flex items-start gap-4 rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-background p-6">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
      <Bell className="h-7 w-7" />
    </div>

    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Create Notice
      </h1>

      <p className="mt-2 text-muted-foreground">
        Publish important announcements for students and faculty.
      </p>
    </div>
  </div>

  <form
    onSubmit={handleSubmit}
    className="overflow-hidden rounded-3xl border bg-card shadow-sm"
  >

    <div className="border-b px-8 py-6">
      <h2 className="text-lg font-semibold">
        Notice Details
      </h2>

      <p className="text-sm text-muted-foreground mt-1">
        Fill in the details below to publish your notice.
      </p>
    </div>

    <div className="space-y-7 p-8">

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Title */}

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Title
        </Label>

        <Input
          placeholder="Enter notice title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="h-11"
        />
      </div>

      {/* Content */}

      <div className="space-y-2">
        <Label>Content</Label>

        <Textarea
          rows={6}
          placeholder="Write your notice here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="resize-none"
        />
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        Leave Department and Semester empty if this notice is for the entire college.
      </div>
            {/* Department */}

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Department (Optional)
        </Label>

        <Autocomplete
          placeholder="Select department..."
          value={departmentId}
          onChange={setDepartmentId}
          options={departments.map((d) => ({
            value: d.id.toString(),
            label: d.name!,
          }))}
        />
      </div>

      {/* Semester */}

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Semester (Optional)
        </Label>

        <Autocomplete
          placeholder="Select semester..."
          value={semesterId}
          onChange={setSemesterId}
          options={semesters.map((s) => ({
            value: s.id.toString(),
            label: `Semester ${s.number}`,
          }))}
          disabled={!courseId}
        />
      </div>

      {/* Attachment */}

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          Attachment (Optional)
        </Label>

        <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-6 transition hover:bg-muted/50">
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <p className="mt-3 text-xs text-muted-foreground">
            Supported formats: PDF, JPG, JPEG, PNG
          </p>

          {file && (
            <div className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              📎 {file.name}
            </div>
          )}
        </div>
      </div>

    </div>

    {/* Footer */}

    <div className="flex items-center justify-end border-t bg-muted/30 px-8 py-5">
      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="min-w-[190px] gap-2 rounded-xl shadow-md"
      >
        <Send className="h-4 w-4" />

        {loading ? "Posting Notice..." : "Post Notice"}
      </Button>
    </div>

  </form>

</div>
)
}