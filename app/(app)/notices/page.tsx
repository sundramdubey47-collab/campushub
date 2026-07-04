"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Pin, Archive } from "lucide-react"
import { useSession } from "next-auth/react"

type Notice = {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  postedBy: { name: string; role: string }
}

export default function NoticesPage() {
  const { data: session } = useSession()
  const canManage = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(
    (session?.user as any)?.role
  )

  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  async function loadNotices() {
    setLoading(true)
    const res = await fetch("/api/notices")
    const data = await res.json()
    setNotices(data)
    setLoading(false)
  }

  useEffect(() => {
    loadNotices()
  }, [])

  async function togglePin(id: number, current: boolean) {
    await fetch(`/api/notices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !current }),
    })
    loadNotices()
  }

  async function archiveNotice(id: number) {
    await fetch(`/api/notices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    })
    loadNotices()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notices</h1>
        {canManage && (
          <Link href="/notices/create">
            <Button>Naya Notice Banao</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Load ho raha hai...</p>
      ) : notices.length === 0 ? (
        <p className="text-muted-foreground">Koi notice nahi hai</p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="border rounded-lg p-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notice.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  <h2 className="font-semibold">{notice.title}</h2>
                </div>

                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => togglePin(notice.id, notice.isPinned)}
                      title={notice.isPinned ? "Unpin karo" : "Pin karo"}
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => archiveNotice(notice.id)}
                      title="Archive karo"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{notice.content}</p>
              <p className="text-xs text-muted-foreground">
                By {notice.postedBy.name} ({notice.postedBy.role}) — {new Date(notice.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}