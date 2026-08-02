"use client"

import { useEffect } from "react"
import { requestNotificationPermissionAndToken, listenForForegroundMessages } from "@/lib/firebase-client"
import { updateAppBadge } from "@/lib/app-badge"

export function NotificationPermission() {
  useEffect(() => {
    async function setup() {
      console.log("[Notifications] Requesting permission...")
      const token = await requestNotificationPermissionAndToken()

      if (!token) {
        console.warn("[Notifications] No token received — permission denied or unsupported browser")
        return
      }

      console.log("[Notifications] Token received, registering with server...")
      const res = await fetch("/api/notifications/register-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token }),
      })

      if (res.ok) {
        console.log("[Notifications] Device registered successfully")
      } else {
        console.error("[Notifications] Failed to register device")
      }
    }

    setup()

   listenForForegroundMessages((payload) => {
  console.log("[Notifications] Foreground message received:", payload)
  if (Notification.permission === "granted") {
    new Notification(payload.notification?.title || "CampusHub", {
      body: payload.notification?.body || "",
      icon: "/icon-192.png",
    })
  }

  // Foreground me bhi badge refresh kar dete hain
  fetch("/api/notifications-v2")
    .then((r) => r.json())
    .then((data) => updateAppBadge(data.unreadCount))
})
  }, [])

  return null
}