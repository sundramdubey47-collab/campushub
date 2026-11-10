
import { prisma } from "@/lib/prisma"

type NotifyParams = {
  userId: number
  type: string
  title: string
  body: string
  link?: string
}

export async function notifyUser({
  userId,
  type,
  title,
  body,
  link,
}: NotifyParams) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        body,
        link: link || null,
      },
    })
  } catch (err) {
    console.error("[notifyUser] Failed to save notification:", err)
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

    if (!users.length) return

    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: type as any,
        title,
        body,
        link: link || null,
      })),
    })
  } catch (err) {
    console.error("[notifyCollege] Failed to save notifications:", err)
  }
}
