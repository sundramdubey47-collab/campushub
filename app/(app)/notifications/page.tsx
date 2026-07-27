"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Bell, FileText, Calendar, ShoppingBag, Package, HelpCircle, CheckCircle2 } from "lucide-react"

type NotifItem = { id: number; title: string; createdAt: string; type: string; link: string }

const ICONS: Record<string, any> = {
  notice: Bell,
  event: Calendar,
  marketplace: ShoppingBag,
  rental: Package,
  resource: FileText,
  request: HelpCircle,
  fulfilled: CheckCircle2,
}

const CATEGORY_LABELS: Record<string, string> = {
  notice: "Notice",
  event: "Event",
  marketplace: "Marketplace",
  rental: "Rental",
  resource: "Resource",
  request: "Request",
  fulfilled: "Fulfilled",
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items)
        setLoading(false)
      })
    fetch("/api/notifications/mark-seen", { method: "POST" })
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
              <Link key={`${item.type}-${item.id}`} href={item.link}>
                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors">
                  <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[item.type] || "Update"}
                    </span>
                    <p className="text-sm font-medium mt-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
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