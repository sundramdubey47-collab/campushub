"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Pin,
  Archive,
  Paperclip,
  FileText,
  Download,
  User,
  CalendarDays,
} from "lucide-react"

type Notice = {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  attachmentUrl?: string | null
  postedBy: {
    name: string
    role: string
  }
}

export function NoticeCardClient({
  notice,
  canManage,
}: {
  notice: Notice
  canManage: boolean
}) {
  const [isPinned, setIsPinned] = useState(notice.isPinned)
  const [archived, setArchived] = useState(false)

  async function togglePin() {
    await fetch(`/api/notices/${notice.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isPinned: !isPinned,
      }),
    })

    setIsPinned(!isPinned)
  }

  async function archiveNotice() {
    await fetch(`/api/notices/${notice.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isArchived: true,
      }),
    })

    setArchived(true)
  }

  if (archived) return null

  const isImage = notice.attachmentUrl?.match(
    /\.(jpg|jpeg|png|gif|webp)$/i
  )

  const isPdf = notice.attachmentUrl?.match(/\.pdf$/i)

  const isNew =
    Date.now() -
      new Date(notice.createdAt).getTime() <
    1000 * 60 * 60 * 24

  const initials = notice.postedBy.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-card transition-all duration-300 ${
        isPinned
          ? "border-2 border-yellow-400 shadow-yellow-200/50"
          : "border"
      }`}
    >
      {/* Header */}

      <div className="flex items-start justify-between gap-4 p-5">

        <div className="flex items-start gap-4 flex-1">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white shadow-lg">

            {initials}

          </div>

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              {isPinned && (
                <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-[10px] font-bold uppercase text-black">
                  📌 Pinned
                </span>
              )}

            </div>

            <h2 className="mt-3 text-xl font-bold leading-tight">

              {notice.title}

            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">

              {notice.content}

            </p>

          </div>

        </div>

        {canManage && (

          <div className="flex gap-2">

            <Button
              size="icon"
              variant="outline"
              onClick={togglePin}
            >
              <Pin className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={archiveNotice}
            >
              <Archive className="h-4 w-4" />
            </Button>

          </div>

        )}

      </div>
            {/* Attachment */}

      {notice.attachmentUrl && (
        <div className="px-5 pb-5">

          {isImage ? (

            <a
              href={notice.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border bg-muted shadow-sm transition hover:shadow-xl"
            >
              <img
                src={notice.attachmentUrl}
                alt="Notice Attachment"
                className="max-h-[500px] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            </a>

          ) : isPdf ? (

            <div className="rounded-2xl border bg-gradient-to-r from-red-50 to-white p-5 dark:from-red-950/20 dark:to-background">

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-red-500 p-3 text-white shadow">
                    <FileText className="h-7 w-7" />
                  </div>

                  <div>

                    <h3 className="font-semibold">
                      PDF Attachment
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Open or download the attached PDF file.
                    </p>

                  </div>

                </div>

                <Button asChild>

                  <a
                    href={notice.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Open
                  </a>

                </Button>

              </div>

            </div>

          ) : (

            <Button
              asChild
              variant="secondary"
              className="rounded-xl"
            >

              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Download Attachment
              </a>

            </Button>

          )}

        </div>
      )}

      {/* Footer */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/30 px-5 py-4">

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">

          <div className="flex items-center gap-2">

            <User className="h-4 w-4" />

            <span className="font-medium">
              {notice.postedBy.name}
            </span>

          </div>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">

            {notice.postedBy.role}

          </span>

        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">

          <CalendarDays className="h-4 w-4" />

          <span>
  {formatDistanceToNow(new Date(notice.createdAt), {
    addSuffix: true,
  })}
</span>

        </div>

      </div>

    </div>
  )
}