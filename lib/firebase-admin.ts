import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { getAuth } from "firebase-admin/auth"
function normalizeKey(raw?: string) {
  if (!raw) return ""
  let key = raw.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }
  return key.replace(/\\n/g, "\n")
}

// Sirf true/false batata hai, value kabhi nahi
export function firebaseAdminEnvStatus() {
  const key = normalizeKey(process.env.FIREBASE_PRIVATE_KEY)
  return {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID?.trim(),
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL?.trim(),
    FIREBASE_PRIVATE_KEY: key.includes("BEGIN PRIVATE KEY") && key.includes("END PRIVATE KEY"),
  }
}

let cached: App | null = null

function getAdminApp(): App {
  if (cached) return cached

  const bad = Object.entries(firebaseAdminEnvStatus())
    .filter(([, ok]) => !ok)
    .map(([k]) => k)
  if (bad.length) throw new Error(`Firebase admin env missing or malformed: ${bad.join(", ")}`)

  cached =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!.trim(),
        privateKey: normalizeKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    })

  return cached
}

// Import par kuch nahi chalta, isliye env galat hone par baaki routes crash nahi hote
export function getAdminMessaging() {
  return getMessaging(getAdminApp())
}
export function getAdminAuth() {
  return getAuth(getAdminApp())
}