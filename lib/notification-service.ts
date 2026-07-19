import { prisma } from "@/lib/prisma"

type NotificationPayload = {
  userId: number
  title: string
  body: string
  url?: string
}

export async function sendPushNotification({
  userId,
  title,
  body,
  url = "/dashboard",
}: NotificationPayload) {

  // Lazy import
  const { adminMessaging } = await import("@/lib/firebase-admin")

  const devices = await prisma.userDevice.findMany({
    where: {
      userId,
    },
  })

  if (!devices.length) return

  const tokens = devices.map((d) => d.fcmToken)
console.log("Devices:", devices)
console.log("Tokens:", tokens)

 const result = await adminMessaging.sendEachForMulticast({
  tokens,
  notification: {
    title,
    body,
  },
  data: {
    url,
  },
  webpush: {
    notification: {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    },
  },
})

console.log("FCM Result:", JSON.stringify(result, null, 2))
}