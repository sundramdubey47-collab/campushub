"use client"

import { useEffect } from "react"
import {
  getFCMToken,
  listenForegroundNotifications,
} from "@/lib/firebase-messaging"

export default function NotificationProvider() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    async function init() {
      try {
        if (!("Notification" in window)) {
          return
        }

        let permission = Notification.permission

        if (permission !== "granted") {
          permission = await Notification.requestPermission()
        }

        if (permission !== "granted") {
          return
        }

        const token = await getFCMToken()

        if (!token) {
          return
        }

        const res = await fetch("/api/fcm/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            platform: "web",
          }),
        })

        if (!res.ok) {
          console.error("Failed to register FCM token")
        }

        unsubscribe = await listenForegroundNotifications((payload) => {
          const title = payload.notification?.title ?? "CampusHub"
          const body = payload.notification?.body ?? ""

          const notification = new Notification(title, {
            body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            requireInteraction: true,
          })

          notification.onclick = () => {
            window.focus()
            window.location.href = payload.data?.url || "/dashboard"
          }
        })
      } catch (err) {
        console.error("Notification init failed:", err)
      }
    }

    init()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return null
}