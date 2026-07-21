"use client"

import { useEffect, useState } from "react"
import { MapPin, User, Clock } from "lucide-react"

type Slot = {
  subjectName: string
  startTime: string
  endTime: string
  room: string | null
  facultyName: string | null
}

export function NowInClass() {
  const [current, setCurrent] = useState<Slot | null>(null)
  const [next, setNext] = useState<Slot | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/timetable/current")
      .then((r) => r.json())
      .then((data) => {
        setCurrent(data.current)
        setNext(data.next)
        setLoaded(true)
      })
  }, [])

  if (!loaded || (!current && !next)) return null

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-primary/10 p-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="font-semibold text-sm">{current ? "Now in Class" : "Next Class"}</h2>
      </div>

      {current ? (
        <div className="space-y-1">
          <p className="text-base font-bold">{current.subjectName}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {current.startTime} - {current.endTime}</span>
            {current.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {current.room}</span>}
            {current.facultyName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {current.facultyName}</span>}
          </div>
        </div>
      ) : next ? (
        <div className="space-y-1">
          <p className="text-base font-bold">{next.subjectName}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Starts at {next.startTime}</span>
            {next.room && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {next.room}</span>}
          </div>
        </div>
      ) : null}
    </div>
  )
}