"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Bell, FileText, Calendar, ShoppingBag, Package, HelpCircle, CheckCircle2 } from "lucide-react"

type NotifItem = { id: number; title: string; body: string; createdAt: string; type: string; link: string | null; isRead: boolean }

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
  SYSTEM: Bell,
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications-v2")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items)
        setLoading(false)
      })
    fetch("/api/notifications-v2/mark-read", { method: "POST" })
  }, [])

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Notifications" description="Everything happening across your campus" />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = ICONS[item.type] || Bell
            return (
              <Link key={item.id} href={item.link || "/dashboard"}>
                <div className={`flex items-start gap-3 rounded-xl border p-4 hover:bg-muted/50 transition-colors ${!item.isRead ? "bg-primary/5 border-primary/20" : "bg-card"}`}>
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.body}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}