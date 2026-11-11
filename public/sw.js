/* CampusHub service worker. Sirf push notifications aur installability. Koi caching nahi. */

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purane next-pwa wale saare cache saaf (isi se purani UI atakti thi)
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      } catch (e) {}
      await self.clients.claim()
    })()
  )
})

// Install prompt ke liye handler chahiye. Kuch cache nahi karta, request seedhi network ko jaati hai.
self.addEventListener("fetch", () => {})

function readPayload(event) {
  if (!event.data) return {}
  try {
    return event.data.json()
  } catch (e) {
    try {
      return { data: { body: event.data.text() } }
    } catch (e2) {
      return {}
    }
  }
}

self.addEventListener("push", (event) => {
  const raw = readPayload(event)
  const data = raw.data || raw
  const note = raw.notification || {}

  const title = data.title || note.title || "CampusHub"
  const body = data.body || note.body || ""
  const url = data.url || (raw.fcmOptions && raw.fcmOptions.link) || "/dashboard"
  const badge = Number(data.badge || 0)

  event.waitUntil(
    (async () => {
      if (badge > 0 && self.navigator && "setAppBadge" in self.navigator) {
        try {
          await self.navigator.setAppBadge(badge)
        } catch (e) {}
      }

      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      const visible = windows.find((w) => w.visibilityState === "visible")

      // App khuli aur dikh rahi hai to system notification nahi, app ke andar toast dikhao
      if (visible) {
        windows.forEach((w) => w.postMessage({ type: "PUSH", payload: { title, body, url, badge } }))
        return
      }

      await self.registration.showNotification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        tag: data.tag || undefined,
        data: { url },
        vibrate: [120, 60, 120],
      })
    })()
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  let target = "/dashboard"
  try {
    const u = new URL((event.notification.data && event.notification.data.url) || "/dashboard", self.location.origin)
    if (u.origin === self.location.origin) target = u.pathname + u.search + u.hash
  } catch (e) {}

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      for (const w of windows) {
        if ("focus" in w) {
          await w.focus()
          if ("navigate" in w) {
            try {
              await w.navigate(target)
            } catch (e) {}
          }
          return
        }
      }
      await self.clients.openWindow(target)
    })()
  )
})