import { prisma } from "@/lib/prisma"
import { adminMessaging } from "@/lib/firebase-admin"

const FCM_BATCH = 500 // FCM ek call me max 500 tokens leta hai

type PushPayload = { title: string; body: string; url?: string }

async function sendToTokens(tokens: string[], { title, body, url = "/dashboard" }: PushPayload) {
  const unique = [...new Set(tokens)]

  for (let i = 0; i < unique.length; i += FCM_BATCH) {
    const chunk = unique.slice(i, i + FCM_BATCH)

    const result = await adminMessaging.sendEachForMulticast({
      tokens: chunk,
      notification: { title, body },
      data: { url },
      webpush: {
        headers: { Urgency: "high" },
        notification: { title, body, icon: "/icon-192.png", badge: "/icon-192.png", requireInteraction: true },
        fcmOptions: { link: url },
      },
    })

    const dead: string[] = []
    result.responses.forEach((r, idx) => {
      const code = r.error?.code
      if (!r.success && (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token")) {
        dead.push(chunk[idx])
      }
    })
    if (dead.length) await prisma.userDevice.deleteMany({ where: { fcmToken: { in: dead } } })
  }
}

export async function sendPushNotification({ userId, title, body, url }: PushPayload & { userId: number }) {
  const devices = await prisma.userDevice.findMany({ where: { userId }, select: { fcmToken: true } })
  if (!devices.length) return
  await sendToTokens(devices.map((d) => d.fcmToken), { title, body, url })
}

export async function sendPushNotificationToUsers({ userIds, title, body, url }: PushPayload & { userIds: number[] }) {
  if (!userIds.length) return
  const devices = await prisma.userDevice.findMany({ where: { userId: { in: userIds } }, select: { fcmToken: true } })
  if (!devices.length) return
  await sendToTokens(devices.map((d) => d.fcmToken), { title, body, url })
}

export async function sendPushNotificationToCollege({ collegeId, title, body, url }: PushPayload & { collegeId: number }) {
  const devices = await prisma.userDevice.findMany({ where: { user: { collegeId } }, select: { fcmToken: true } })
  if (!devices.length) return
  await sendToTokens(devices.map((d) => d.fcmToken), { title, body, url })
}