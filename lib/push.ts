import { fetchFcmToken, dropFcmToken } from "@/lib/firebase-client"

const TOKEN_KEY = "ch_fcm_token"
const TOKEN_AT_KEY = "ch_fcm_token_at"
const OWNER_KEY = "ch_fcm_owner"
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000

export function pushSupport(): { supported: boolean; reason?: string } {
  if (typeof window === "undefined") return { supported: false, reason: "unsupported" }

  const hasPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
  if (hasPush) return { supported: true }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  return { supported: false, reason: isIOS ? "ios_install" : "unsupported" }
}

export function reasonText(reason?: string, detail?: string) {
  switch (reason) {
    case "ios_install":
      return "iPhone par pehle Safari me Share → Add to Home Screen karo, phir CampusHub ko home screen wale icon se kholo."
    case "unsupported":
      return "Is browser me push notifications support nahi hain. Android par Chrome use karo."
    case "denied":
      return "Notifications blocked hain. Browser ya phone ki site settings me CampusHub ke Notifications ko Allow karo, phir page reload karo."
    case "bad_vapid":
      return "App ka notification key (NEXT_PUBLIC_FIREBASE_VAPID_KEY) galat hai. Firebase Console se dobara copy karke Vercel me daalo aur redeploy karo."
    case "no_service_worker":
      return "Service worker register nahi ho paya. 'Reset & fix' dabao."
    case "server_rejected":
      return "Server ne device register nahi kiya. Dobara login karke try karo."
    case "token_failed":
      return `Firebase se token nahi mila${detail ? ` (${detail})` : ""}. Firebase project, API key restrictions aur VAPID key check karo.`
    default:
      return "Kuch galat hua. 'Reset & fix' dabao."
  }
}

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase()
  const os = /android/.test(ua) ? "android" : /iphone|ipad|ipod/.test(ua) ? "ios" : /windows/.test(ua) ? "windows" : /mac/.test(ua) ? "mac" : "other"
  const standalone = window.matchMedia("(display-mode: standalone)").matches
  return `${os}-${standalone ? "app" : "browser"}`
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null
  try {
    // Purane/dusre service workers hata do, sirf /sw.js rahe
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      regs
        .filter((r) => {
          const url = (r.active || r.waiting || r.installing)?.scriptURL ?? ""
          return url && !url.endsWith("/sw.js")
        })
        .map((r) => r.unregister())
    )

    await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
    return await navigator.serviceWorker.ready
  } catch (err) {
    console.error("[push] service worker register failed:", err)
    return null
  }
}

async function postToken(token: string) {
  const res = await fetch("/api/notifications/register-device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken: token, platform: detectPlatform() }),
  })
  return res.ok
}

export async function enablePush(): Promise<{ ok: boolean; reason?: string; detail?: string }> {
  const support = pushSupport()
  if (!support.supported) return { ok: false, reason: support.reason }

  let permission = Notification.permission
  if (permission === "default") permission = await Notification.requestPermission()
  if (permission !== "granted") return { ok: false, reason: "denied" }

  const reg = await registerServiceWorker()
  if (!reg) return { ok: false, reason: "no_service_worker" }

  try {
    const token = await fetchFcmToken(reg)
    if (!(await postToken(token))) return { ok: false, reason: "server_rejected" }

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_AT_KEY, String(Date.now()))
    localStorage.removeItem(OWNER_KEY)
    return { ok: true }
  } catch (err: any) {
    if (err?.message === "BAD_VAPID") return { ok: false, reason: "bad_vapid" }
    return { ok: false, reason: "token_failed", detail: err?.code || err?.message }
  }
}

// Chupchap (bina popup) token taaza rakhta hai, jab permission pehle se mili ho
export async function syncPushToken(reg: ServiceWorkerRegistration, owner: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return
  try {
    const token = await fetchFcmToken(reg)
    const sameToken = localStorage.getItem(TOKEN_KEY) === token
    const sameOwner = localStorage.getItem(OWNER_KEY) === owner
    const recent = Date.now() - Number(localStorage.getItem(TOKEN_AT_KEY) || 0) < REFRESH_MS
    if (sameToken && sameOwner && recent) return

    if (await postToken(token)) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(TOKEN_AT_KEY, String(Date.now()))
      localStorage.setItem(OWNER_KEY, owner)
    }
  } catch (err) {
    console.error("[push] token sync failed:", err)
  }
}

// Logout par: is device ko is account se hata do
export async function unregisterThisDevice() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      await fetch("/api/notifications/register-device", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken: token }),
      })
    }
  } catch {}
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_AT_KEY)
  localStorage.removeItem(OWNER_KEY)
}

// Sab kuch saaf: purane workers, token, local state
export async function resetPush() {
  await dropFcmToken()
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.unregister()))
  } catch {}
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_AT_KEY)
  localStorage.removeItem(OWNER_KEY)
}