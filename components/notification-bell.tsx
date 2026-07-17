"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, FileText, Calendar, ShoppingBag, Package, Bell as BellIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, CheckCircle2 } from "lucide-react" // is import ko upar add karo

type NotifItem = { id: number; title: string; createdAt: string; type: string; link: string }


const ICONS: Record<string, any> = {
  notice: BellIcon,
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

export function NotificationBell() {
  const [items, setItems] = useState<NotifItem[]>([])
  const [unseenCount, setUnseenCount] = useState(0)

  async function load() {
    const res = await fetch("/api/notifications")
    const data = await res.json()
    setItems(data.items)
    setUnseenCount(data.unseenCount)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleOpen(open: boolean) {
    if (open && unseenCount > 0) {
      await fetch("/api/notifications/mark-seen", { method: "POST" })
      setUnseenCount(0)
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unseenCount > 99 ? "99+" : unseenCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">No notifications yet</div>
        ) : (
          items.map((item) => {
            const Icon = ICONS[item.type] || Bell
            return (
              <DropdownMenuItem key={`${item.type}-${item.id}`} asChild>
                <Link href={item.link} className="flex items-start gap-2.5 py-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {CATEGORY_LABELS[item.type] || "Update"}
                      </span>
                    </div>
                    <p className="text-sm truncate mt-1">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}