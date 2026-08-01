import { prisma } from "@/lib/prisma"
import { sendPushNotification, sendPushNotificationToCollege } from "@/lib/notification-service"

type NotifyParams = {
  userId: number
  type: string
  title: string
  body: string
  link?: string
}

export async function notifyUser({ userId, type, title, body, link }: NotifyParams) {
  try {
    await prisma.notification.create({
      data: { userId, type: type as any, title, body, link: link || null },
    })
  } catch (err) {
    console.error("[notifyUser] Failed to save notification row:", err)
  }

  try {
    await sendPushNotification({ userId, title, body, url: link || "/dashboard" })
  } catch (err) {
    console.error("[notifyUser] Failed to send push:", err)
  }
}

export async function notifyCollege({
  collegeId,
  type,
  title,
  body,
  link,
  excludeUserId,
}: {
  collegeId: number
  type: string
  title: string
  body: string
  link?: string
  excludeUserId?: number
}) {
  try {
    const users = await prisma.user.findMany({
      where: { collegeId, ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: type as any,
        title,
        body,
        link: link || null,
      })),
    })
  } catch (err) {
    console.error("[notifyCollege] Failed to save notification rows:", err)
  }

  try {
    await sendPushNotificationToCollege({ collegeId, title, body, url: link || "/dashboard" })
  } catch (err) {
    console.error("[notifyCollege] Failed to send push:", err)
  }
}