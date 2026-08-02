"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateAppBadge } from "@/lib/app-badge"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

 async function load() {
  const res = await fetch("/api/notifications-v2")
  const data = await res.json()
  setUnreadCount(data.unreadCount)
  updateAppBadge(data.unreadCount)
}

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  )
}