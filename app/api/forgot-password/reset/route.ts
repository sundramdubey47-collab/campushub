import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.json()
  const { email, otp, newPassword } = body

  if (!email || !otp || !newPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const record = await prisma.passwordResetOTP.findFirst({
    where: { email, otp, used: false },
    orderBy: { createdAt: "desc" },
  })

  if (!record || new Date() > record.expiresAt) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  })

  await prisma.passwordResetOTP.update({
    where: { id: record.id },
    data: { used: true },
  })

  return NextResponse.json({ success: true })
}