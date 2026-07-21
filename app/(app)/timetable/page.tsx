"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Calendar, MapPin, User, Clock } from "lucide-react"

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

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

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="My Timetable" description="Your weekly class schedule" />

      {slots.length === 0 ? (
        <EmptyState icon={Calendar} title="No timetable available yet" description="Your college hasn't uploaded a schedule for your class yet" />
      ) : (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day)
            if (daySlots.length === 0) return null
            return (
              <div key={day} className={`rounded-xl border bg-card p-4 space-y-2 ${day === today ? "border-primary/50" : ""}`}>
                <p className="font-semibold text-sm flex items-center gap-2">
                  {DAY_LABELS[day]}
                  {day === today && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>}
                </p>
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-start gap-3 border-t pt-2">
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}