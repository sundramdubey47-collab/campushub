"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, X } from "lucide-react"

type Row = {
  Department: string
  BranchName: string
  BranchCode: string
  DurationYears: string
  SemesterNumber: string
  SubjectName: string
  SubjectCode: string
}

export function AiStructureImport({ collegeId, onDone }: { collegeId: string | number; onDone: () => void }) {
  const [text, setText] = useState("")
  const [department, setDepartment] = useState("")
  const [branchName, setBranchName] = useState("")
  const [branchCode, setBranchCode] = useState("")
  const [durationYears, setDurationYears] = useState("4")
  const [rows, setRows] = useState<Row[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  async function convert() {
    setMessage("")
    setRows(null)
    setBusy(true)

    const res = await fetch("/api/super-admin/ai-structure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, department, branchName, branchCode, durationYears }),
    })
    const data = await res.json()
    setBusy(false)

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }
    setRows(data.rows)
  }

  async function importRows() {
    if (!rows || rows.length === 0) return
    setBusy(true)
    setMessage("")

    const res = await fetch("/api/super-admin/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collegeId, rows }),
    })
    const data = await res.json()
    setBusy(false)

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }

    setMessage(
      `✅ Imported: ${data.created.departments} departments, ${data.created.courses} branches, ${data.created.semesters} semesters, ${data.created.subjects} subjects`
    )
    setRows(null)
    setText("")
    onDone()
  }

  const semesters = rows ? [...new Set(rows.map((r) => Number(r.SemesterNumber)))].sort((a, b) => a - b) : []

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-primary" /> AI Quick Import (syllabus paste karo)
      </h3>
      <p className="text-xs text-muted-foreground">
        Syllabus ya subject list ka text paste karo. AI use rows me badal dega, tum preview dekhke import karoge. Ek baar me ek branch
        ya 2-3 semester paste karo.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Department (e.g. Engineering)" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <Input placeholder="Branch name (e.g. B.Tech CSE)" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
        <Input placeholder="Branch code (e.g. CSE)" value={branchCode} onChange={(e) => setBranchCode(e.target.value)} />
        <Input type="number" placeholder="Duration (years)" value={durationYears} onChange={(e) => setDurationYears(e.target.value)} />
      </div>

      <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Semester 1: Engineering Mathematics-I, Physics, ..." />

      <Button size="sm" onClick={convert} disabled={busy || text.trim().length < 20}>
        {busy && !rows ? "Converting..." : "Convert with AI"}
      </Button>

      {message && <p className="text-sm">{message}</p>}

      {rows && (
        <div className="space-y-2">
          <p className="text-xs font-medium">
            Preview: {rows.length} subjects, semesters {semesters.join(", ")}. Galat row par ✕ dabake hata do.
          </p>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs">
                <span className="truncate">
                  <b>Sem {r.SemesterNumber}</b> • {r.SubjectName} <span className="text-muted-foreground">({r.SubjectCode})</span>
                </span>
                <button type="button" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                  <X className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <Button size="sm" onClick={importRows} disabled={busy || rows.length === 0}>
            {busy ? "Importing..." : `Import ${rows.length} subjects`}
          </Button>
        </div>
      )}
    </div>
  )
}