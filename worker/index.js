importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js")

firebase.initializeApp({
  apiKey: "AIzaSyA_G6XHJTIz0hQcn3ZoVLMy2RWFF_QKFVw",
  authDomain: "campushub-5008b.firebaseapp.com",
  projectId: "campushub-5008b",
  storageBucket: "campushub-5008b.appspot.com",
  messagingSenderId: "145131064777",
  appId: "1:145131064777:web:90241dcac05b40b4b9ac18",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "CampusHub"
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: payload.data?.url || "/dashboard" },
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

self.addEventListener("push", (event) => {
  console.log("[Badge Debug] push event fired")

  event.waitUntil(
    fetch("/api/notifications-v2")
      .then((res) => {
        console.log("[Badge Debug] /api/notifications-v2 status:", res.status)
        return res.json()
      })
      .then((data) => {
        console.log("[Badge Debug] response data:", data)
        console.log("[Badge Debug] unreadCount:", data.unreadCount)
        console.log("[Badge Debug] setAppBadge supported:", "setAppBadge" in self.navigator)

        if (data.unreadCount > 0 && "setAppBadge" in self.navigator) {
          return self.navigator.setAppBadge(data.unreadCount)
            .then(() => console.log("[Badge Debug] setAppBadge SUCCESS, count:", data.unreadCount))
            .catch((e) => console.error("[Badge Debug] setAppBadge FAILED:", e))
        } else if ("clearAppBadge" in self.navigator) {
          console.log("[Badge Debug] no unread — clearing badge")
          return self.navigator.clearAppBadge()
        } else {
          console.log("[Badge Debug] setAppBadge NOT supported on this browser")
        }
      })
      .catch((err) => console.error("[SW Badge] fetch failed:", err))
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/dashboard"
  event.waitUntil(clients.openWindow(url))
})

if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)
}