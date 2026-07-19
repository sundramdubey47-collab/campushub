"use client"

import { useEffect } from "react"
import {
  getFCMToken,
  listenForegroundNotifications,
} from "@/lib/firebase-messaging"

export default function NotificationProvider() {
  useEffect(() => {
    async function init() {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission()
      }

      if (Notification.permission !== "granted") return

      const token = await getFCMToken()

      if (!token) return

      console.log("FCM Token:", token)

      await fetch("/api/fcm/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      await listenForegroundNotifications((payload) => {
        console.log(payload)
      })
    }

    init()
  }, [])

  return null
}