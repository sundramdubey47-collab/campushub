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

  const app = getFirebaseApp()
  const messaging = getMessaging(app)

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/firebase-cloud-messaging-push-scope",
    })
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    return token
  } catch (err) {
    console.error("FCM token error:", err)
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