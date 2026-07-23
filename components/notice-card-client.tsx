"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pin, Archive, Paperclip, Landmark } from "lucide-react"

type Notice = {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  attachmentUrl?: string | null
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

  const isImage = notice.attachmentUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i)
  const noticeNumber = `CH/NTC/${new Date(notice.createdAt).getFullYear()}/${String(notice.id).padStart(4, "0")}`

  return (
    <div className={`rounded-lg border-2 bg-card overflow-hidden ${isPinned ? "border-primary/50" : "border-border"}`}>
      {/* Letterhead strip */}
      <div className="bg-primary/5 border-b-2 border-primary/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Official Notice</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{noticeNumber}</span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isPinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
            <h2 className="font-bold text-sm uppercase tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>{notice.title}</h2>
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

        <div className="border-l-2 border-primary/20 pl-3">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{notice.content}</p>
        </div>

        {notice.attachmentUrl && (
          <div className="pt-1">
            {isImage ? (
              <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                <img src={notice.attachmentUrl} alt="Notice attachment" className="max-h-64 rounded-lg border object-contain" />
              </a>
            ) : (
              <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2">
                <Paperclip className="h-3.5 w-3.5" /> View Attachment
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-dashed">
          <p className="text-[11px] text-muted-foreground">
            Issued by: <span className="font-medium text-foreground">{notice.postedBy.name}</span> ({notice.postedBy.role})
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  )
}