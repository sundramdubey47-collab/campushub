import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

export async function POST() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login required" }, { status: 401 })

  if (dbUser.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 })
  }

  const result = checkRateLimit(`verify-email:${dbUser.id}`, RATE_LIMITS.AUTH_STRICT)
  if (!result.allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.passwordResetOTP.create({
    data: { email: `verify:${dbUser.email}`, otp, expiresAt },
  })

  try {
    await resend.emails.send({
      from: "CampusHub <onboarding@resend.dev>",
      to: dbUser.email,
      subject: "Verify your CampusHub email",
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    })
  } catch (err) {
    console.error("Email send failed:", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}