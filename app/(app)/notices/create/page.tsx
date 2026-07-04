"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Autocomplete } from "@/components/autocomplete"

type Option = { id: number; name?: string; number?: number }

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
    if (!departmentId) { setCourses([]); setCourseId(""); return }
    fetch(`/api/department-courses?departmentId=${departmentId}`)
      .then((res) => res.json())
      .then(setCourses)
  }, [departmentId])

  useEffect(() => {
    if (!courseId) { setSemesters([]); setSemesterId(""); return }
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
      headers: { "Content-Type": "application/json" },
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
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Notice Banao</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5} />
        </div>

        <p className="text-sm text-muted-foreground">
          Niche khaali chhodo agar poori college ke liye notice hai
        </p>

        <div className="space-y-2">
          <Label>Department (optional)</Label>
          <Autocomplete
            placeholder="Department chuno..."
            value={departmentId}
            onChange={setDepartmentId}
            options={departments.map((d) => ({ value: d.id.toString(), label: d.name! }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Branch (optional)</Label>
          <Autocomplete
            placeholder="Branch chuno..."
            value={courseId}
            onChange={setCourseId}
            options={courses.map((c) => ({ value: c.id.toString(), label: c.name! }))}
            disabled={!departmentId}
          />
        </div>

        <div className="space-y-2">
          <Label>Semester (optional)</Label>
          <Autocomplete
            placeholder="Semester chuno..."
            value={semesterId}
            onChange={setSemesterId}
            options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
            disabled={!courseId}
          />
        </div>

        <div className="space-y-2">
          <Label>Attachment (optional)</Label>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Post ho raha hai..." : "Notice Post Karo"}
        </Button>
      </form>
    </div>
  )
}