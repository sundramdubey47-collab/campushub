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
  await prisma.notification.create({
    data: { userId, type: type as any, title, body, link: link || null },
  })

  // Push notification bhi bhejte hain (agar device registered hai)
  await sendPushNotification({ userId, title, body, url: link || "/dashboard" })
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

  await sendPushNotificationToCollege({ collegeId, title, body, url: link || "/dashboard" })
}