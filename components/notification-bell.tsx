"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateAppBadge } from "@/lib/app-badge"

export function NotificationBell() {
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications-v2/count", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setCount(data.count ?? 0)
      updateAppBadge(data.count ?? 0)
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, 45000)
    const onVisible = () => {
      if (document.visibilityState === "visible") load()
    }

    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("ch:notifications-changed", load)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("ch:notifications-changed", load)
    }
  }, [load])

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </Link>
  )
}