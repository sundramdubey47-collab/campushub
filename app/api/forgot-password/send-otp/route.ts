import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const body = await req.json()
  const email = body.email?.trim()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const allowed = checkRateLimit(`forgot-password:${email}`, 3, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Security: hamesha same message do, chahe email exist kare ya na kare
  // (taaki koi ye pata na laga sake kaunsa email registered hai)
  if (!user) {
    return NextResponse.json({ success: true })
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.passwordResetOTP.create({
    data: { email, otp, expiresAt },
  })

  try {
    await resend.emails.send({
      from: "CampusHub <onboarding@resend.dev>",
      to: email,
      subject: "Your CampusHub Password Reset Code",
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    })
  } catch (err) {
    console.error("Email send failed:", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}