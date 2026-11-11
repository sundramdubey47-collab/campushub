import { prisma } from "@/lib/prisma"
import { sendPushToUsers } from "@/lib/notification-service"

const VALID_TYPES = new Set([
  "NOTICE", "EVENT", "MARKETPLACE", "RENTAL", "RESOURCE", "RESOURCE_REQUEST", "RESOURCE_FULFILLED",
  "RENTAL_REQUEST", "RENTAL_APPROVED", "CLASS_UPCOMING", "CLASS_LIVE", "FOOD", "SYSTEM",
])

const safeType = (type: string) => (VALID_TYPES.has(type) ? type : "SYSTEM")

type Base = { type: string; title: string; body: string; link?: string }

async function saveRows(userIds: number[], { type, title, body, link }: Base) {
  const rows = (t: string) => userIds.map((userId) => ({ userId, type: t as any, title, body, link: link || null }))

  try {
    await prisma.notification.createMany({ data: rows(safeType(type)) })
  } catch (err) {
    // Type database ke enum me nahi hai (jaise migration baaki hai) to SYSTEM ke roop me save karo
    console.error("[notify] createMany failed, retrying as SYSTEM:", err)
    try {
      await prisma.notification.createMany({ data: rows("SYSTEM") })
    } catch (err2) {
      console.error("[notify] could not save notification rows:", err2)
    }
  }
}

export async function notifyUsers({ userIds, ...base }: Base & { userIds: number[] }) {
  const ids = [...new Set(userIds)]
  if (ids.length === 0) return

  await saveRows(ids, base)

  try {
    await sendPushToUsers({
      userIds: ids,
      title: base.title,
      body: base.body,
      url: base.link,
      type: safeType(base.type),
    })
  } catch (err) {
    console.error("[notify] push failed:", err)
  }
}

export async function notifyUser({ userId, ...base }: Base & { userId: number }) {
  await notifyUsers({ userIds: [userId], ...base })
}

export async function notifyCollege({
  collegeId,
  excludeUserId,
  courseId,
  semesterId,
  ...base
}: Base & { collegeId: number; excludeUserId?: number; courseId?: number; semesterId?: number }) {
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
    await notifyUsers({ userIds: users.map((u) => u.id), ...base })
  } catch (err) {
    console.error("[notifyCollege] failed:", err)
  }
}