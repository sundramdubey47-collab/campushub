"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/autocomplete"
import { Combobox } from "@/components/combobox"
import { Trash2 } from "lucide-react"

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
]

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
  const [error, setError] = useState("")

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
      body: JSON.stringify({ dayOfWeek, startTime, endTime, subjectName, room, facultyName, courseId, semesterId }),
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

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Manage Timetable" description="Set up class schedules for each branch and semester" />

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
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Add Class Slot</h3>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Day</Label>
              <Combobox placeholder="Day" value={dayOfWeek} onChange={setDayOfWeek} options={DAYS} />
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
      )}

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
                      <p className="font-medium">{slot.subjectName}</p>
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
    </div>
  )
}