"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AcademicInfoPage() {
  const router = useRouter()
  const [courseName, setCourseName] = useState<string | null>(null)
  const [semesters, setSemesters] = useState<{ id: number; number: number }[]>([])
  const [semesterId, setSemesterId] = useState("")
  const [section, setSection] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/profile/academic", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setCourseName(d.courseName)
        setSemesters(d.semesters ?? [])
        setSemesterId(d.semesterId ? String(d.semesterId) : "")
        setSection(d.section ?? "")
      })
  }, [])

  async function save() {
    setMessage("")
    setSaving(true)
    const res = await fetch("/api/profile/academic", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semesterId, section }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }
    setMessage("✅ Updated. Timetable aur attendance ab naye semester ke hisaab se dikhenge.")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">Semester & Section</h1>
      {courseName && <p className="text-sm text-muted-foreground">Branch: {courseName}</p>}

      <div className="space-y-1.5">
        <Label>Semester</Label>
        <select
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Select semester</option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id}>
              Semester {s.number}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Section</Label>
        <Input value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} placeholder="A" maxLength={5} />
      </div>

      {message && <p className="text-sm">{message}</p>}

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  )
}