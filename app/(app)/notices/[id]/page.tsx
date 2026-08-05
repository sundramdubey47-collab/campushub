"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { NoticeCardClient } from "@/components/notice-card-client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type Notice = {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  attachmentUrl?: string | null
  postedBy: { name: string; role: string }
}

export default function NoticeDetailPage() {
  const params = useParams()
  const noticeId = params.id

  const [notice, setNotice] = useState<Notice | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/notices/${noticeId}/detail`).then((r) => r.json()),
      fetch("/api/auth/session").then((r) => r.json()),
    ]).then(([noticeData, sessionData]) => {
      setNotice(noticeData)
      const role = sessionData?.user?.role
      setCanManage(["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(role))
      setLoading(false)
    })
  }, [noticeId])

  if (loading) return <p className="text-muted-foreground">Loading...</p>
  if (!notice) return <p className="text-red-500 text-sm">Notice not found</p>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/notices" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Notices
      </Link>
      <NoticeCardClient notice={notice} canManage={canManage} />
    </div>
  )
}