import { initializeApp, getApps } from "firebase/app"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig)
  }
  return getApps()[0]
}

export async function requestNotificationPermissionAndToken(): Promise<string | null> {
  const supported = await isSupported()
  if (!supported) return null

  const permission = await Notification.requestPermission()
  if (permission !== "granted") return null

  const rawVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

  if (!rawVapidKey) {
    console.error("[FCM] VAPID key is missing from environment variables")
    return null
  }

  // Kabhi-kabhi .env me quotes ya extra whitespace/newline aa jaते hain copy-paste ke waqt —
  // ye unhe saaf kar deता hai taaki base64 decode fail na ho
  const vapidKey = rawVapidKey.trim().replace(/^["']|["']$/g, "")

  if (vapidKey.length < 80) {
    console.error("[FCM] VAPID key looks too short/malformed:", vapidKey.length, "characters")
    return null
  }

  const app = getFirebaseApp()
  const messaging = getMessaging(app)

  try {
    const registration = await navigator.serviceWorker.ready

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })
    return token
  } catch (err) {
    console.error("[FCM] getToken failed:", err)
    return null
  }
}
export function listenForForegroundMessages(callback: (payload: any) => void) {
  isSupported().then((supported) => {
    if (!supported) return
    const app = getFirebaseApp()
    const messaging = getMessaging(app)
    onMessage(messaging, callback)
  })
}