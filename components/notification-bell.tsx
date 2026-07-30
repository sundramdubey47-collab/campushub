"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, FileText, Calendar, ShoppingBag, Package, HelpCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

export function NotificationBell() {
  const [items, setItems] = useState<NotifItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  async function load() {
    const res = await fetch("/api/notifications-v2")
    const data = await res.json()
    setItems(data.items)
    setUnreadCount(data.unreadCount)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleOpen(open: boolean) {
    if (open && unreadCount > 0) {
      await fetch("/api/notifications-v2/mark-read", { method: "POST" })
      setUnreadCount(0)
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No notifications yet</div>
        ) : (
          items.slice(0, 8).map((item) => {
            const Icon = ICONS[item.type] || Bell
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link href={item.link || "/dashboard"} className="flex items-start gap-2.5 py-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  {!item.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </Link>
              </DropdownMenuItem>
            )
          })
        )}
        <div className="border-t p-2">
          <Link href="/notifications" className="block text-center text-xs font-medium text-primary py-1.5 hover:underline">
            See All Notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}