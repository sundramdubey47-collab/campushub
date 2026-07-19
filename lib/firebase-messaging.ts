"use client"

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging"

import { firebaseApp } from "./firebase"

let messaging: ReturnType<typeof getMessaging> | null = null

async function getMessagingInstance() {
  const supported = await isSupported()

  if (!supported) return null

  if (!messaging) {
    messaging = getMessaging(firebaseApp)
  }

  return messaging
}

export async function getFCMToken() {
  const messaging = await getMessagingInstance()

  if (!messaging) return null

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  )

  await navigator.serviceWorker.ready

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    serviceWorkerRegistration: registration,
  })

  return token
}

export async function listenForegroundNotifications(
  callback: (payload: any) => void
) {
  const messaging = await getMessagingInstance()

  if (!messaging) return

  return onMessage(messaging, callback)
}