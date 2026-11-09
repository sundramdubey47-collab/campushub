import { prisma } from "@/lib/prisma"
import { sendPushNotification, sendPushNotificationToUsers } from "@/lib/notification-service"

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
  courseId,
  semesterId,
}: {
  collegeId: number
  type: string
  title: string
  body: string
  link?: string
  excludeUserId?: number
  courseId?: number
  semesterId?: number
}) {
  let userIds: number[] = []

  try {
    const users = await prisma.user.findMany({
      where: {
        collegeId,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        ...(courseId ? { courseId } : {}),
        ...(semesterId ? { semesterId } : {}),
      },
      select: { id: true },
    })
    userIds = users.map((u) => u.id)

    if (userIds.length) {
      await prisma.notification.createMany({
        data: userIds.map((id) => ({ userId: id, type: type as any, title, body, link: link || null })),
      })
    }
  } catch (err) {
    console.error("[notifyCollege] Failed to save notification rows:", err)
  }

  try {
    await sendPushNotificationToUsers({ userIds, title, body, url: link || "/dashboard" })
  } catch (err) {
    console.error("[notifyCollege] Failed to send push:", err)
  }
}