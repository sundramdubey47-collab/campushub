"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { enablePush, pushSupport, reasonText } from "@/lib/push"

const DISMISS_KEY = "ch_notif_banner_dismissed"
const HIDE_FOR_MS = 3 * 24 * 60 * 60 * 1000

export function EnableNotificationsBanner() {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!pushSupport().supported) return
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    const recentlyDismissed = Date.now() - dismissedAt < HIDE_FOR_MS
    setShow(Notification.permission === "default" && !recentlyDismissed)
  }, [])

  if (!show) return null

  async function enable() {
    setBusy(true)
    setError("")
    const result = await enablePush()
    setBusy(false)

    if (result.ok) {
      setShow(false)
      return
    }
    setError(reasonText(result.reason, result.detail))
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  return (
    <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-full bg-primary/15 p-2">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <p className="flex-1 text-xs leading-snug">
          <span className="font-semibold">Class reminders chahiye?</span>
          <br />
          <span className="text-muted-foreground">Class se 10 minute pehle, notices aur tests ki notification paao.</span>
        </p>
        <Button size="sm" onClick={enable} disabled={busy}>
          {busy ? "..." : "Turn on"}
        </Button>
        <button type="button" onClick={dismiss} aria-label="Dismiss">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500">
          {error}{" "}
          <Link href="/profile/notifications" className="underline">
            Fix karo
          </Link>
        </p>
      )}
    </div>
  )
}