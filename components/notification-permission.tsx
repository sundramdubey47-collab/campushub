"use client"

import { useEffect } from "react"
import { requestNotificationPermissionAndToken, listenForForegroundMessages } from "@/lib/firebase-client"

export function NotificationPermission() {
  useEffect(() => {
    async function setup() {
      const token = await requestNotificationPermissionAndToken()
      if (token) {
        await fetch("/api/notifications/register-device", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token }),
        })
      }
    }

    setup()

    listenForForegroundMessages((payload) => {
      // Jab app khुला hو (foreground me), tab bhi ek notification dikhाते hain
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "CampusHub", {
          body: payload.notification?.body || "",
          icon: "/icon-192.png",
        })
      }
    })
  }, [])

  return null
}