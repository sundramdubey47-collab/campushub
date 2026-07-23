"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Check, X, MinusCircle, Search } from "lucide-react"

type HistoryItem = {
  id: number
  subject: string
  date: string
  status: string
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  PRESENT: { icon: Check, color: "text-[oklch(var(--success))] bg-[oklch(var(--success)/0.1)]", label: "Present" },
  ABSENT: { icon: X, color: "text-red-500 bg-red-500/10", label: "Absent" },
  NOT_CONDUCTED: { icon: MinusCircle, color: "text-muted-foreground bg-muted", label: "Not Held" },
}

export function AttendanceHistoryClient({ history, subjects }: { history: HistoryItem[]; subjects: string[] }) {
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? history.filter((h) => h.subject.toLowerCase().includes(search.toLowerCase()))
    : history

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSearch(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                search === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
          {search && (
            <button onClick={() => setSearch("")} className="text-xs px-2.5 py-1 rounded-full border text-muted-foreground">
              Clear
            </button>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No records found</p>
        ) : (
          filtered.map((item) => {
            const config = STATUS_CONFIG[item.status]
            const Icon = config.icon
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <div className={`rounded-full p-1.5 ${config.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 text-sm font-medium">{item.subject}</span>
                <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>{config.label}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}