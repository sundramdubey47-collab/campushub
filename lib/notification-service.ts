import { prisma } from "@/lib/prisma"
import { adminMessaging } from "@/lib/firebase-admin"

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
  const devices = await prisma.userDevice.findMany({ where: { userId } })

  if (!devices.length) {
    console.log(`No registered devices for user ${userId}`)
    return
  }

  const tokens = devices.map((d) => d.fcmToken)

  const result = await adminMessaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: { url },
    webpush: {
      headers: { Urgency: "high" },
      notification: {
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        requireInteraction: true,
      },
      fcmOptions: { link: url },
    },
  })

  // Invalid/expired tokens automatically hata dete hain
  for (let i = 0; i < result.responses.length; i++) {
    const response = result.responses[i]
    if (!response.success && response.error?.code === "messaging/registration-token-not-registered") {
      await prisma.userDevice.deleteMany({ where: { fcmToken: tokens[i] } })
    }
  }
}

type CollegeNotificationPayload = {
  collegeId: number
  title: string
  body: string
  url?: string
}

export async function sendPushNotificationToCollege({
  collegeId,
  title,
  body,
  url = "/dashboard",
}: CollegeNotificationPayload) {
  const devices = await prisma.userDevice.findMany({
    where: { user: { collegeId } },
  })

  if (!devices.length) {
    console.log(`No registered devices for college ${collegeId}`)
    return
  }

  const tokens = [...new Set(devices.map((d) => d.fcmToken))]

  const result = await adminMessaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: { url },
    webpush: {
      headers: { Urgency: "high" },
      notification: {
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        requireInteraction: true,
      },
      fcmOptions: { link: url },
    },
  })

  for (let i = 0; i < result.responses.length; i++) {
    const response = result.responses[i]
    if (!response.success && response.error?.code === "messaging/registration-token-not-registered") {
      await prisma.userDevice.deleteMany({ where: { fcmToken: tokens[i] } })
    }
  }
}