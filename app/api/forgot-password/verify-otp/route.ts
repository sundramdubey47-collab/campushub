import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const body = await req.json()
  const { email, otp } = body

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
  }

  const record = await prisma.passwordResetOTP.findFirst({
    where: { email, otp, used: false },
    orderBy: { createdAt: "desc" },
  })

  if (!record) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
  }

  if (new Date() > record.expiresAt) {
    return NextResponse.json({ error: "OTP has expired" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}