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
  const isNew = Date.now() - new Date(notice.createdAt).getTime() < 1000 * 60 * 60 * 24

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md ${
        isPinned ? "border-primary" : "border-border"
      }`}
    >
      {/* ================= HEADER STRIP ================= */}
      <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <Landmark className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isPinned ? "Important Notice" : "Information Notice"}
          </span>
          {isNew && (
            <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              NEW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPinned && (
            <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
              PINNED
            </span>
          )}
          {canManage && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={togglePin}>
                <Pin className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={archiveNotice}>
                <Archive className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold leading-7" style={{ fontFamily: "var(--font-heading)" }}>
            {notice.title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ref. No. {noticeNumber}</p>
        </div>

        <p className="text-sm leading-7 whitespace-pre-wrap text-foreground">{notice.content}</p>

        {notice.attachmentUrl && (
          <div className="pt-1 -mx-5">
            {isImage ? (
              <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={notice.attachmentUrl}
                  alt="Notice attachment"
                  className="w-full rounded-lg border object-contain max-h-80 bg-muted"
                />
              </a>
            ) : (
              <div className="px-5">
               <a 
                  href={notice.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2"
                >
                  <Paperclip className="h-3.5 w-3.5" /> View Attachment
                </a>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            Published By: <span className="font-medium text-foreground">{notice.postedBy.name}</span>
            <span className="text-muted-foreground"> • {notice.postedBy.role}</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">
            {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  )
}