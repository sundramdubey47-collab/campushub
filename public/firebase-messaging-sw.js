importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js");

firebase.initializeApp({

  apiKey: "AIzaSyA_G6XHJTIz0hQcn3ZoVLMy2RWFF_QKFVw",



  authDomain: "campushub-5008b.firebaseapp.com",

  projectId: "campushub-5008b",

  storageBucket: "campushub-5008b.appspot.com",

  messagingSenderId: "145131064777",

  appId: "1:145131064777:web:90241dcac05b40b4b9ac18",



});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw] Background Message:", payload);

  const notification = payload.notification || {};

  self.registration.showNotification(
    notification.title || "CampusHub",
    {
      body: notification.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: payload.data || {},
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});