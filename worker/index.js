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

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/dashboard"
  event.waitUntil(clients.openWindow(url))
})

// next-pwa ka apna precaching yahi single service worker file me integrate ho raha hai
if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)
}