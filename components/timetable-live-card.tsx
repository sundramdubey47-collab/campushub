"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User, ChevronRight, ChevronLeft } from "lucide-react"

type Slot = {
  id: number
  subjectName: string
  startTime: string
  endTime: string
  room: string | null
  facultyName: string | null
  markedStatus: string | null
} | null

const SLIDE_META = [
  { key: "current" as const, label: "Live Now", badge: "LIVE" },
  { key: "next" as const, label: "Next Class", badge: "NEXT" },
  { key: "following" as const, label: "Then", badge: "UPCOMING" },
]

function ClassSlide({ slot, label, onMark, marking }: { slot: Slot; label: string; onMark: (id: number, status: string) => void; marking: number | null }) {
  if (!slot) {
    return (
      <div className="rounded-xl border bg-muted/20 p-4 text-center">
        <p className="text-sm text-muted-foreground">No {label.toLowerCase()} scheduled</p>
      </div>
    )
  }

  const isLive = label === "Live Now"

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${isLive ? "border-[oklch(var(--success)/0.4)] bg-[oklch(var(--success)/0.08)]" : "bg-muted/30"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isLive ? "text-[oklch(var(--success))]" : "text-muted-foreground"}`}>
          {isLive && <span className="h-1.5 w-1.5 rounded-full bg-[oklch(var(--success))] animate-pulse" />}
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
      </div>
      <p className="font-semibold text-sm">{slot.subjectName}</p>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {slot.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {slot.room}</span>}
        {slot.facultyName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {slot.facultyName}</span>}
      </div>

      {isLive && (
        slot.markedStatus ? (
          <p className="text-xs font-medium text-[oklch(var(--success))]">✓ Marked as {slot.markedStatus}</p>
        ) : (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="h-7 text-xs" disabled={marking === slot.id} onClick={() => onMark(slot.id, "PRESENT")}>Present</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={marking === slot.id} onClick={() => onMark(slot.id, "ABSENT")}>Absent</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={marking === slot.id} onClick={() => onMark(slot.id, "NOT_CONDUCTED")}>Not Held</Button>
          </div>
        )
      )}
    </div>
  )
}

export function TimetableLiveCard() {
  const [data, setData] = useState<{ current: Slot; next: Slot; following: Slot } | null>(null)
  const [summary, setSummary] = useState<{ overallPercent: number; totalMarked: number } | null>(null)
  const [marking, setMarking] = useState<number | null>(null)
  const [index, setIndex] = useState(0)

  async function load() {
    const [liveRes, summaryRes] = await Promise.all([
      fetch("/api/timetable/live").then((r) => r.json()),
      fetch("/api/attendance/summary").then((r) => r.json()),
    ])
    setData(liveRes)
    setSummary(summaryRes)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-slide har 5 second me
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % 3), 5000)
    return () => clearInterval(timer)
  }, [])

  async function markAttendance(slotId: number, status: string) {
    setMarking(slotId)
    await fetch("/api/attendance/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timetableSlotId: slotId, status }),
    })
    setMarking(null)
    load() // Fresh data laata hai — isse har slide ka apna alag, sahi status dikhता hai
  }

  if (!data || (!data.current && !data.next && !data.following)) return null

  const progressColor =
    !summary || summary.totalMarked < 5
      ? "bg-red-500"
      : summary.totalMarked <= 15
      ? "bg-yellow-500"
      : "bg-[oklch(var(--success))]"

  const currentMeta = SLIDE_META[index]
  const currentSlot = data[currentMeta.key]

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Today's Classes
        </h2>
        <Link href="/timetable" className="text-xs text-primary hover:underline">Full Timetable</Link>
      </div>

      <ClassSlide slot={currentSlot} label={currentMeta.label} onMark={markAttendance} marking={marking} />

      {/* Slide dots + arrows */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {SLIDE_META.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIndex((i) => (i - 1 + 3) % 3)}
            className="h-6 w-6 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % 3)}
            className="h-6 w-6 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {summary && (
        <Link href="/attendance" className="flex items-center gap-3 pt-2 border-t hover:opacity-80 transition-opacity">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium">Attendance: {summary.overallPercent}%</span>
              <span className="text-muted-foreground flex items-center gap-0.5">View Details <ChevronRight className="h-3 w-3" /></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${summary.overallPercent}%` }} />
            </div>
          </div>
        </Link>
      )}
    </div>
  )
}