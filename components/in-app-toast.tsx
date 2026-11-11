"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

type Toast = { title: string; body: string; url: string }

export function InAppToast() {
  const router = useRouter()
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const onPush = (e: Event) => {
      const p = (e as CustomEvent).detail || {}
      setToast({ title: p.title || "CampusHub", body: p.body || "", url: p.url || "/notifications" })
      clearTimeout(timer)
      timer = setTimeout(() => setToast(null), 5000)
    }

    window.addEventListener("ch:push", onPush)
    return () => {
      window.removeEventListener("ch:push", onPush)
      clearTimeout(timer)
    }
  }, [])

  if (!toast) return null

  return (
    <button
      type="button"
      onClick={() => {
        router.push(toast.url)
        setToast(null)
      }}
      className="fixed left-1/2 top-3 z-[120] flex w-[min(92vw,26rem)] -translate-x-1/2 items-start gap-3 rounded-2xl border bg-card p-3 text-left shadow-xl"
      style={{ marginTop: "env(safe-area-inset-top)" }}
    >
      <span className="shrink-0 rounded-full bg-primary/15 p-2">
        <Bell className="h-4 w-4 text-primary" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{toast.title}</span>
        <span className="block text-xs text-muted-foreground line-clamp-2">{toast.body}</span>
      </span>
    </button>
  )
}