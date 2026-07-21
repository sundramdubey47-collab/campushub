"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/autocomplete"
import { Combobox } from "@/components/combobox"
import { Trash2, Upload, CheckCircle2, AlertTriangle } from "lucide-react"

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
]

const DAY_LABELS: Record<number, string> = {
  0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat",
}

type Course = { id: number; name: string }
type Semester = { id: number; number: number }
type Slot = {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  subjectName: string
  room: string | null
  facultyName: string | null
  section: string | null
}
type ParsedRow = {
  rowIndex: number
  dayOfWeek: number | null
  startTime: string
  endTime: string
  subjectName: string
  room: string
  facultyName: string
  section: string
  errors: string[]
}

export default function AdminTimetablePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [slots, setSlots] = useState<Slot[]>([])

  const [courseId, setCourseId] = useState("")
  const [semesterId, setSemesterId] = useState("")

  const [dayOfWeek, setDayOfWeek] = useState("1")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [room, setRoom] = useState("")
  const [facultyName, setFacultyName] = useState("")
  const [section, setSection] = useState("A")
  const [error, setError] = useState("")

  // Upload/Preview state
  const [uploading, setUploading] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[] | null>(null)
  const [parsedFileName, setParsedFileName] = useState("")
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState("")

  useEffect(() => {
    fetch("/api/college-courses").then((r) => r.json()).then(setCourses)
  }, [])

  useEffect(() => {
    if (!courseId) { setSemesters([]); setSemesterId(""); return }
    fetch(`/api/course-semesters?courseId=${courseId}`).then((r) => r.json()).then(setSemesters)
  }, [courseId])

  useEffect(() => {
    if (!courseId || !semesterId) { setSlots([]); return }
    loadSlots()
  }, [courseId, semesterId])

  async function loadSlots() {
    const res = await fetch(`/api/admin/timetable?courseId=${courseId}&semesterId=${semesterId}`)
    setSlots(await res.json())
  }

  async function addSlot() {
    setError("")
    if (!startTime || !endTime || !subjectName) {
      setError("Time and Subject are required")
      return
    }

    const res = await fetch("/api/admin/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek, startTime, endTime, subjectName, room, facultyName, section, courseId, semesterId }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      return
    }

    setStartTime(""); setEndTime(""); setSubjectName(""); setRoom(""); setFacultyName("")
    loadSlots()
  }

  async function deleteSlot(id: number) {
    await fetch(`/api/admin/timetable/${id}`, { method: "DELETE" })
    loadSlots()
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setImportMessage("")
    setParsedRows(null)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/admin/timetable/parse", { method: "POST", body: formData })
    const data = await res.json()
    setUploading(false)

    if (!res.ok) {
      setImportMessage("❌ " + data.error)
      return
    }

    setParsedRows(data.rows)
    setParsedFileName(data.fileName)
  }

  async function confirmImport() {
    if (!parsedRows || !courseId || !semesterId) return
    setImporting(true)
    setImportMessage("")

    const res = await fetch("/api/admin/timetable/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, semesterId, rows: parsedRows, fileName: parsedFileName }),
    })
    const data = await res.json()
    setImporting(false)

    if (!res.ok) {
      setImportMessage("❌ " + data.error)
      return
    }

    setImportMessage(`✅ Imported ${data.imported} class slots successfully`)
    setParsedRows(null)
    loadSlots()
  }

  const validCount = parsedRows?.filter((r) => r.errors.length === 0).length ?? 0
  const errorCount = parsedRows?.filter((r) => r.errors.length > 0).length ?? 0

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Manage Timetable" description="Upload an Excel/CSV file, or add class slots manually" />

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Autocomplete
              placeholder="Select branch..."
              value={courseId}
              onChange={setCourseId}
              options={courses.map((c) => ({ value: c.id.toString(), label: c.name }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Semester</Label>
            <Autocomplete
              placeholder="Select semester..."
              value={semesterId}
              onChange={setSemesterId}
              options={semesters.map((s) => ({ value: s.id.toString(), label: `Semester ${s.number}` }))}
              disabled={!courseId}
            />
          </div>
        </div>
      </div>

      {courseId && semesterId && (
        <>
          {/* Bulk Upload */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" /> Bulk Upload (Excel/CSV)
            </h3>
            <p className="text-xs text-muted-foreground">
              Columns expected: Day, StartTime, EndTime, Subject, Room, Faculty, Section (optional — supports multiple sections in one file)
            </p>
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={uploading} />
            {importMessage && <p className="text-sm">{importMessage}</p>}
          </div>

          {/* Preview */}
          {parsedRows && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Preview: {parsedFileName}</h3>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1 text-[oklch(var(--success))]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {validCount} valid
                  </span>
                  {errorCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-3.5 w-3.5" /> {errorCount} errors
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1.5">
                {parsedRows.map((row) => (
                  <div
                    key={row.rowIndex}
                    className={`text-xs p-2 rounded-lg border ${row.errors.length > 0 ? "border-red-300 bg-red-50" : "border-transparent bg-muted/40"}`}
                  >
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-medium">Row {row.rowIndex}</span>
                      <span>{row.dayOfWeek !== null ? DAY_LABELS[row.dayOfWeek] : "?"}</span>
                      <span>{row.startTime}-{row.endTime}</span>
                      <span className="font-medium">{row.subjectName || "(no subject)"}</span>
                      {row.room && <span>• {row.room}</span>}
                      {row.facultyName && <span>• {row.facultyName}</span>}
                      <span className="bg-muted px-1.5 py-0.5 rounded">Sec {row.section}</span>
                    </div>
                    {row.errors.length > 0 && (
                      <p className="text-red-600 mt-1">{row.errors.join(" · ")}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={confirmImport} disabled={importing || validCount === 0}>
                  {importing ? "Importing..." : `Approve & Import ${validCount} Slots`}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setParsedRows(null)}>Cancel</Button>
              </div>
              {errorCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Note: Only the {validCount} valid rows will be imported. Fix errors in your file and re-upload to include the rest.
                </p>
              )}
            </div>
          )}

          {/* Manual Add */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm">Add Single Slot Manually</h3>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Day</Label>
                <Combobox placeholder="Day" value={dayOfWeek} onChange={setDayOfWeek} options={DAYS} />
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Input value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} placeholder="A" />
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Data Structures" />
              </div>
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Room (optional)</Label>
                <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. LT 203" />
              </div>
              <div className="space-y-1.5">
                <Label>Faculty (optional)</Label>
                <Input value={facultyName} onChange={(e) => setFacultyName(e.target.value)} placeholder="e.g. Dr. Sharma" />
              </div>
            </div>

            <Button size="sm" onClick={addSlot}>Add Slot</Button>
          </div>

          {/* Current Slots */}
          {slots.length > 0 && (
            <div className="space-y-2">
              {DAYS.map((day) => {
                const daySlots = slots.filter((s) => s.dayOfWeek === Number(day.value))
                if (daySlots.length === 0) return null
                return (
                  <div key={day.value} className="rounded-xl border bg-card p-4 space-y-2">
                    <p className="font-semibold text-sm">{day.label}</p>
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between text-sm border-t pt-2">
                        <div>
                          <p className="font-medium">
                            {slot.subjectName} <span className="text-xs text-muted-foreground">(Sec {slot.section || "A"})</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {slot.startTime} - {slot.endTime}
                            {slot.room && ` • ${slot.room}`}
                            {slot.facultyName && ` • ${slot.facultyName}`}
                          </p>
                        </div>
                        <button onClick={() => deleteSlot(slot.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}