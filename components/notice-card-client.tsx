"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pin, Archive } from "lucide-react"

type Notice = {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  postedBy: { name: string; role: string }
}

export function NoticeCardClient({ notice, canManage }: { notice: Notice; canManage: boolean }) {
  const [isPinned, setIsPinned] = useState(notice.isPinned)
  const [archived, setArchived] = useState(false)

  async function togglePin() {
    await fetch(`/api/notices/${notice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !isPinned }),
    })
    setIsPinned(!isPinned)
  }

  async function archiveNotice() {
    await fetch(`/api/notices/${notice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    })
    setArchived(true)
  }

  if (archived) return null

  return (
    <div className={`rounded-xl border bg-card p-4 space-y-2 ${isPinned ? "border-primary/40" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
          <h2 className="font-semibold text-sm">{notice.title}</h2>
        </div>

        {canManage && (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePin}>
              <Pin className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={archiveNotice}>
              <Archive className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>

      <p className="text-[11px] text-muted-foreground pt-1 border-t">
        {notice.postedBy.name} • {notice.postedBy.role} • {new Date(notice.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}