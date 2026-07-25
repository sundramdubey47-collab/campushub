"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Calendar, MapPin, User, Clock, CalendarCheck, ChevronRight } from "lucide-react"

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type Slot = {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
  subjectName: string
  room: string | null
  facultyName: string | null
}

export default function StudentTimetablePage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"week" | "day">("day")
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  useEffect(() => {
    fetch("/api/timetable")
      .then((r) => r.json())
      .then((data) => {
        setSlots(data)
        setLoading(false)
      })
  }, [])

  const today = new Date().getDay()

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  const daySlots = slots.filter((s) => s.dayOfWeek === selectedDay)

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="My Timetable"
        description="Your weekly class schedule"
        action={
          <Link href="/attendance" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
            <CalendarCheck className="h-4 w-4" /> See Attendance
          </Link>
        }
      />

      <div className="flex rounded-xl border bg-muted/30 p-1">
        <button
          onClick={() => setView("day")}
          className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${view === "day" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
        >
          Day View
        </button>
        <button
          onClick={() => setView("week")}
          className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${view === "week" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
        >
          Week View
        </button>
      </div>

      {slots.length === 0 ? (
        <EmptyState icon={Calendar} title="No timetable available yet" description="Your college hasn't uploaded a schedule for your class yet" />
      ) : view === "day" ? (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-center min-w-[52px] transition-colors ${
                  selectedDay === day ? "bg-primary text-primary-foreground border-primary" : "bg-card"
                }`}
              >
                <p className="text-[10px] font-medium uppercase">{DAY_SHORT[day]}</p>
                {day === today && <span className="text-[8px]">●</span>}
              </button>
            ))}
          </div>

          {daySlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No classes on {DAY_LABELS[selectedDay]}</p>
          ) : (
            <div className="rounded-xl border bg-card p-4 space-y-2">
              {daySlots.map((slot) => (
                <div key={slot.id} className="flex items-start gap-3 border-t first:border-t-0 pt-2 first:pt-0">
                  <div className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">{slot.startTime}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{slot.subjectName}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {slot.startTime}-{slot.endTime}</span>
                      {slot.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {slot.room}</span>}
                      {slot.facultyName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {slot.facultyName}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const ds = slots.filter((s) => s.dayOfWeek === day)
            if (ds.length === 0) return null
            return (
              <div key={day} className={`rounded-xl border bg-card p-4 space-y-2 ${day === today ? "border-primary/50" : ""}`}>
                <p className="font-semibold text-sm flex items-center gap-2">
                  {DAY_LABELS[day]}
                  {day === today && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>}
                </p>
                <div className="space-y-2">
                  {ds.map((slot) => (
                    <div key={slot.id} className="flex items-start gap-3 border-t pt-2">
                      <div className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">{slot.startTime}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{slot.subjectName}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {slot.startTime}-{slot.endTime}</span>
                          {slot.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {slot.room}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link href="/attendance" className="flex items-center justify-between rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors">
        <span className="text-sm font-medium flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary" /> See Attendance</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  )
}