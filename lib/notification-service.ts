import type { Message } from "firebase-admin/messaging"
import { prisma } from "@/lib/prisma"
import { getAdminMessaging } from "@/lib/firebase-admin"

const BATCH = 500
const DEAD_TOKEN_CODES = new Set(["messaging/registration-token-not-registered", "messaging/invalid-registration-token"])

export type PushSummary = { devices: number; success: number; failed: number; removed: number; errors: string[] }

type PushInput = { userIds: number[]; title: string; body: string; url?: string; type?: string }

export async function sendPushToUsers({ userIds, title, body, url = "/dashboard", type = "SYSTEM" }: PushInput): Promise<PushSummary> {
  const summary: PushSummary = { devices: 0, success: 0, failed: 0, removed: 0, errors: [] }
  const ids = [...new Set(userIds)]
  if (ids.length === 0) return summary

  let messaging
  try {
    messaging = getAdminMessaging()
  } catch (err: any) {
    summary.errors.push(err?.message ?? "Firebase admin is not configured")
    console.error("[push] firebase admin init failed:", err)
    return summary
  }

  const devices = await prisma.userDevice.findMany({
    where: { userId: { in: ids } },
    select: { fcmToken: true, userId: true },
  })
  summary.devices = devices.length
  if (devices.length === 0) return summary

  // Har user ka unread count, app icon badge ke liye
  const unread = await prisma.notification.groupBy({
    by: ["userId"],
    where: { userId: { in: ids }, isRead: false },
    _count: { _all: true },
  })
  const badgeOf = new Map(unread.map((u) => [u.userId, u._count._all]))

  for (let i = 0; i < devices.length; i += BATCH) {
    const chunk = devices.slice(i, i + BATCH)

    const messages: Message[] = chunk.map((d) => ({
      token: d.fcmToken,
      // Data-only: notification SW khud dikhata hai (duplicate nahi banta)
      data: {
        title,
        body,
        url,
        type,
        tag: `${type}-${Date.now()}-${d.userId}`,
        badge: String(badgeOf.get(d.userId) ?? 0),
      },
      webpush: { headers: { Urgency: "high", TTL: "86400" } },
    }))

    try {
      const res = await messaging.sendEach(messages)
      const dead: string[] = []

      res.responses.forEach((r, idx) => {
        if (r.success) {
          summary.success++
          return
        }
        summary.failed++
        const code = r.error?.code ?? "unknown"
        const text = `${code}: ${(r.error?.message ?? "").slice(0, 160)}`
        if (summary.errors.length < 3 && !summary.errors.includes(text)) summary.errors.push(text)
        if (DEAD_TOKEN_CODES.has(code)) dead.push(chunk[idx].fcmToken)
      })

      if (dead.length) {
        await prisma.userDevice.deleteMany({ where: { fcmToken: { in: dead } } })
        summary.removed += dead.length
      }
    } catch (err: any) {
      summary.failed += chunk.length
      const text = `send failed: ${(err?.message ?? String(err)).slice(0, 200)}`
      if (summary.errors.length < 3) summary.errors.push(text)
      console.error("[push] sendEach failed:", err)
    }
  }

  return summary
}

// Purane imports na tootein, isliye wahi naam
export async function sendPushNotification({ userId, title, body, url }: { userId: number; title: string; body: string; url?: string }) {
  return sendPushToUsers({ userIds: [userId], title, body, url })
}

export async function sendPushNotificationToCollege({ collegeId, title, body, url }: { collegeId: number; title: string; body: string; url?: string }) {
  const users = await prisma.user.findMany({ where: { collegeId }, select: { id: true } })
  return sendPushToUsers({ userIds: users.map((u) => u.id), title, body, url })
}