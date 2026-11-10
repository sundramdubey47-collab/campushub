"use client"

import { useEffect } from "react"
import { requestNotificationPermissionAndToken, listenForForegroundMessages } from "@/lib/firebase-client"
import { updateAppBadge } from "@/lib/app-badge"

export async function registerThisDevice(): Promise<boolean> {
  const token = await requestNotificationPermissionAndToken()
  if (!token) return false

  const res = await fetch("/api/notifications/register-device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken: token }),
  })
  return res.ok
}

export function NotificationPermission() {
  useEffect(() => {
    if (typeof Notification === "undefined") return

    // Pehle se allow hai to chupchap device register karo. Popup yahan se kabhi nahi aayega.
    if (Notification.permission === "granted") registerThisDevice()

    listenForForegroundMessages((payload) => {
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "CampusHub", {
          body: payload.notification?.body || "",
          icon: "/icon-192.png",
        })
      }
      fetch("/api/notifications-v2/count", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => updateAppBadge(d.count ?? 0))
        .catch(() => {})
    })
  }, [])

  return null
}