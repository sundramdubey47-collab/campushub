"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Pin, Archive, Bell, Plus } from "lucide-react"
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
  const canManage = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role)

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
    <div className="space-y-5">
      <PageHeader
        title="Notices"
        description="Important college notices and updates"
        action={
          canManage && (
            <Link href="/notices/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Notice</Button>
            </Link>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : notices.length === 0 ? (
        <EmptyState icon={Bell} title="Currently,there are no notices" description="All new college notices will be shown here instantly" />
      ) : (
        <div className="space-y-3">
          {notices.map((notice, i) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              className={`ch-notebook-line rounded-xl border bg-card p-4 space-y-2 ${
                notice.isPinned ? "border-primary/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {notice.isPinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
                  <h2 className="font-semibold text-sm">{notice.title}</h2>
                </div>

                {canManage && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePin(notice.id, notice.isPinned)}>
                      <Pin className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => archiveNotice(notice.id)}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notice.content}</p>

              <p className="text-[11px] text-muted-foreground pt-1 border-t">
                {notice.postedBy.name} • {notice.postedBy.role} • {new Date(notice.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}