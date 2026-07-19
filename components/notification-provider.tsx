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
const res = await fetch("/api/fcm/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ token }),
})

console.log("FCM Register Status:", res.status)
console.log("FCM Register Response:", await res.text())
     
      await listenForegroundNotifications((payload) => {
        console.log(payload)
      })
    }

    init()
  }, [])

  return null
}