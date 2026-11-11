import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { firebaseAdminEnvStatus } from "@/lib/firebase-admin"
import { sendPushToUsers, type PushSummary } from "@/lib/notification-service"

async function superAdminId() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } })
  return user && user.role === "SUPER_ADMIN" ? user.id : null
}

function hintFor(s: PushSummary): string | undefined {
  const all = s.errors.join(" ").toLowerCase()
  if (s.devices === 0) return "Server ko tumhara koi device registered nahi mila. 'Enable' ya 'Reset & fix' dabao."
  if (all.includes("firebase admin env")) return "Vercel me FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY check karo aur redeploy karo."
  if (all.includes("mismatched-credential")) return "Browser wala Firebase project aur server wala service account alag projects ke hain. Dono ek hi project se lo."
  if (all.includes("has not been used") || all.includes("is disabled") || all.includes("third-party-auth")) return "Google Cloud / Firebase me 'Firebase Cloud Messaging API (V1)' enable karo."
  if (all.includes("not-registered") || all.includes("invalid-registration")) return "Purana token tha, hata diya gaya. Reset & fix dabao aur dobara try karo."
  if (s.success > 0) return "Server ne push bhej diya. 10 second me na dikhe to phone ki battery/autostart settings dekho."
  return undefined
}

export async function GET() {
  const userId = await superAdminId()
  if (!userId) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const devices = await prisma.userDevice.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { fcmToken: true, platform: true },
  })

  return NextResponse.json({
    devices: devices.map((d) => ({ suffix: d.fcmToken.slice(-8), platform: d.platform })),
    adminEnv: firebaseAdminEnvStatus(),
  })
}

export async function POST() {
  const userId = await superAdminId()
  if (!userId) return NextResponse.json({ error: "Permission denied" }, { status: 403 })

  const rate = checkRateLimit(`push-test:${userId}`, { maxAttempts: 5, windowMs: 60_000 })
  if (!rate.allowed) return NextResponse.json({ error: "Thoda ruko, ek minute me 5 se zyada test nahi" }, { status: 429 })

  const summary = await sendPushToUsers({
    userIds: [userId],
    title: "✅ CampusHub test",
    body: "Ye dikh raha hai to notifications sahi chal rahe hain.",
    url: "/profile/notifications",
    type: "SYSTEM",
  })

  return NextResponse.json({ ...summary, hint: hintFor(summary) })
}