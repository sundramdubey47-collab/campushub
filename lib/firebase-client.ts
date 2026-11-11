import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getMessaging, getToken, deleteToken, isSupported } from "firebase/messaging"

// .env me galti se aaye quotes/spaces saaf karta hai
const clean = (v?: string) => (v ?? "").trim().replace(/^["']|["']$/g, "")

// NEXT_PUBLIC variables ko seedha naam se likhna zaroori hai, tabhi build me inline hote hain
const env = {
  NEXT_PUBLIC_FIREBASE_API_KEY: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  NEXT_PUBLIC_FIREBASE_APP_ID: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
}

export function missingFirebaseConfig(): string[] {
  return Object.entries(env)
    .filter(([, v]) => !v)
    .map(([k]) => k)
}

export function getVapidKey(): string | null {
  const key = clean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY).replace(/\s+/g, "")
  return /^[A-Za-z0-9_-]{80,100}$/.test(key) ? key : null
}

function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApps()[0]
  return initializeApp({
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

export async function fetchFcmToken(registration: ServiceWorkerRegistration): Promise<string> {
  const vapidKey = getVapidKey()
  if (!vapidKey) throw new Error("BAD_VAPID")
  if (!(await isSupported())) throw new Error("UNSUPPORTED")

  const messaging = getMessaging(getFirebaseApp())
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
  if (!token) throw new Error("NO_TOKEN")
  return token
}

export async function dropFcmToken() {
  try {
    if (await isSupported()) await deleteToken(getMessaging(getFirebaseApp()))
  } catch {}
}