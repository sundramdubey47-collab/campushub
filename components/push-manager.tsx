"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { registerServiceWorker, syncPushToken } from "@/lib/push"

export function PushManager() {
  const { data: session } = useSession()
  const owner = session?.user?.email ?? ""

  // Service worker register + (permission pehle se mili ho to) token chupchap sync
  useEffect(() => {
    if (!owner) return
    registerServiceWorker().then((reg) => {
      if (reg) syncPushToken(reg, owner)
    })
  }, [owner])

  // App khuli ho tab SW se aaya push yahan milta hai
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "PUSH") return
      window.dispatchEvent(new CustomEvent("ch:push", { detail: event.data.payload }))
      window.dispatchEvent(new Event("ch:notifications-changed"))
    }

    navigator.serviceWorker.addEventListener("message", onMessage)
    return () => navigator.serviceWorker.removeEventListener("message", onMessage)
  }, [])

  return null
}