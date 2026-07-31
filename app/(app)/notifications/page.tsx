"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Bell, FileText, Calendar, ShoppingBag, Package, HelpCircle, CheckCircle2, Activity, Brain } from "lucide-react"

type NotifItem = { id: number; title: string; body: string; createdAt: string; type: string; link: string | null; isRead: boolean }
type PulseData = { newNotes: number; testAttempts: number; chatMessages: number }

const ICONS: Record<string, any> = {
  NOTICE: Bell,
  EVENT: Calendar,
  MARKETPLACE: ShoppingBag,
  RENTAL: Package,
  RENTAL_REQUEST: Package,
  RENTAL_APPROVED: Package,
  RESOURCE: FileText,
  RESOURCE_REQUEST: HelpCircle,
  RESOURCE_FULFILLED: CheckCircle2,
  CLASS_UPCOMING: Bell,
  CLASS_LIVE: Bell,
  QUIZ_LIVE: Brain,
  SYSTEM: Bell,
}

const ICON_BG: Record<string, string> = {
  NOTICE: "oklch(0.55 0.15 278 / 0.12)",
  EVENT: "oklch(0.72 0.15 60 / 0.12)",
  MARKETPLACE: "oklch(0.55 0.13 145 / 0.12)",
  RENTAL: "oklch(0.55 0.15 278 / 0.12)",
  RENTAL_REQUEST: "oklch(0.55 0.15 278 / 0.12)",
  RENTAL_APPROVED: "oklch(var(--success) / 0.12)",
  RESOURCE: "oklch(0.55 0.15 278 / 0.12)",
  RESOURCE_REQUEST: "oklch(0.6 0.18 25 / 0.12)",
  RESOURCE_FULFILLED: "oklch(var(--success) / 0.12)",
  CLASS_UPCOMING: "oklch(0.72 0.15 60 / 0.12)",
  CLASS_LIVE: "oklch(0.6 0.18 25 / 0.12)",
  QUIZ_LIVE: "oklch(0.55 0.15 278 / 0.12)",
  SYSTEM: "oklch(0.55 0.15 278 / 0.12)",
}

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotifItem[]>([])
  const [pulse, setPulse] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications-v2")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items)
        setLoading(false)
      })
    fetch("/api/notifications-v2/mark-read", { method: "POST" })
    fetch("/api/dashboard/pulse").then((r) => r.json()).then(setPulse)
  }, [])

  const pulseText = pulse
    ? [
        pulse.newNotes > 0 && `${pulse.newNotes} new resource${pulse.newNotes > 1 ? "s" : ""}`,
        pulse.testAttempts > 0 && `${pulse.testAttempts} test${pulse.testAttempts > 1 ? "s" : ""} attempted`,
        pulse.chatMessages > 0 && `${pulse.chatMessages} chat message${pulse.chatMessages > 1 ? "s" : ""}`,
      ].filter(Boolean)
    : []

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Notifications" description="Stay updated with everything on campus" />

      {pulseText.length > 0 && (
        <div className="rounded-2xl border bg-gradient-to-r from-primary/8 to-transparent p-4 flex items-start gap-3">
          <div className="rounded-lg bg-primary/15 p-2 shrink-0">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Today on Campus</p>
            <p className="text-xs text-muted-foreground mt-0.5">{pulseText.join(" • ")}</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <div className="rounded-2xl border bg-card divide-y overflow-hidden">
          {items.map((item) => {
            const Icon = ICONS[item.type] || Bell
            return (
              <Link key={item.id} href={item.link || "/dashboard"}>
                <div className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors ${!item.isRead ? "bg-primary/[0.03]" : ""}`}>
                  <div className="rounded-full p-2.5 shrink-0" style={{ backgroundColor: ICON_BG[item.type] || "oklch(0.55 0.15 278 / 0.12)" }}>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{item.body}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{timeAgo(item.createdAt)}</p>
                  </div>
                  {!item.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}