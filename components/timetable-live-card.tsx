"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User, ChevronRight } from "lucide-react"

type Slot = {
  id: number
  subjectName: string
  startTime: string
  endTime: string
  room: string | null
  facultyName: string | null
  markedStatus: string | null
} | null

export function TimetableLiveCard() {
  const [data, setData] = useState<{ current: Slot; next: Slot; following: Slot } | null>(null)
  const [summary, setSummary] = useState<{ overallPercent: number; totalMarked: number } | null>(null)
  const [marking, setMarking] = useState<number | null>(null)

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

  async function markAttendance(slotId: number, status: string) {
    setMarking(slotId)
    await fetch("/api/attendance/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timetableSlotId: slotId, status }),
    })
    setMarking(null)
    load()
  }

  if (!data || (!data.current && !data.next && !data.following)) return null

  const progressColor =
    !summary || summary.totalMarked < 5
      ? "bg-red-500"
      : summary.totalMarked <= 15
      ? "bg-yellow-500"
      : "bg-[oklch(var(--success))]"

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" /> Today's Classes
        </h2>
        <Link href="/timetable" className="text-xs text-primary hover:underline">Full Timetable</Link>
      </div>

      {data.current && (
        <div className="rounded-xl border border-[oklch(var(--success)/0.4)] bg-[oklch(var(--success)/0.08)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[oklch(var(--success))] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(var(--success))] animate-pulse" /> Live Now
            </span>
            <span className="text-xs text-muted-foreground">{data.current.startTime} - {data.current.endTime}</span>
          </div>
          <p className="font-semibold text-sm">{data.current.subjectName}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {data.current.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {data.current.room}</span>}
            {data.current.facultyName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {data.current.facultyName}</span>}
          </div>

          {data.current.markedStatus ? (
            <p className="text-xs font-medium text-[oklch(var(--success))]">✓ Marked as {data.current.markedStatus}</p>
          ) : (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="h-7 text-xs" disabled={marking === data.current.id} onClick={() => markAttendance(data.current!.id, "PRESENT")}>Present</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" disabled={marking === data.current.id} onClick={() => markAttendance(data.current!.id, "ABSENT")}>Absent</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={marking === data.current.id} onClick={() => markAttendance(data.current!.id, "NOT_CONDUCTED")}>Not Held</Button>
            </div>
          )}
        </div>
      )}

      {data.next && (
        <div className="rounded-xl border bg-muted/30 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Next</p>
            <p className="text-sm font-medium">{data.next.subjectName}</p>
          </div>
          <span className="text-xs text-muted-foreground">{data.next.startTime}</span>
        </div>
      )}

      {data.following && (
        <div className="rounded-xl border bg-muted/20 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Then</p>
            <p className="text-sm font-medium">{data.following.subjectName}</p>
          </div>
          <span className="text-xs text-muted-foreground">{data.following.startTime}</span>
        </div>
      )}

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