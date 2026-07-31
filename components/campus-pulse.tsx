"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"

export function CampusPulse() {
  const [data, setData] = useState<{ newNotes: number; testAttempts: number; chatMessages: number; newEvents: number } | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/pulse").then((r) => r.json()).then(setData)
  }, [])

  if (!data || (data.newNotes === 0 && data.testAttempts === 0 && data.chatMessages === 0 && data.newEvents === 0)) return null

  const parts = []
  if (data.newEvents > 0) parts.push(`${data.newEvents} new event${data.newEvents > 1 ? "s" : ""}`)
  if (data.newNotes > 0) parts.push(`${data.newNotes} new resource${data.newNotes > 1 ? "s" : ""}`)
  if (data.testAttempts > 0) parts.push(`${data.testAttempts} test${data.testAttempts > 1 ? "s" : ""} attempted`)
  if (data.chatMessages > 0) parts.push(`${data.chatMessages} campus chat message${data.chatMessages > 1 ? "s" : ""}`)

  return (
    <div className="flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1.5 text-xs text-muted-foreground w-fit">
      <Activity className="h-3 w-3 text-primary" />
      Today on campus: {parts.join(" • ")}
    </div>
  )
}