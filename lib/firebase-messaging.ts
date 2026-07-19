"use client"

import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging"
import { firebaseApp } from "./firebase"

export async function getFCMToken() {
  const supported = await isSupported()

  if (!supported) return null

  const messaging = getMessaging(firebaseApp)

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  })

  return token
}

export async function listenForegroundNotifications(
  callback: (payload: any) => void
) {
  const supported = await isSupported()

  if (!supported) return

  const messaging = getMessaging(firebaseApp)

  onMessage(messaging, callback)
}