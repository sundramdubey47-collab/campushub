import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login required" }, { status: 401 })

  const body = await req.json()
  const { otp } = body

  const record = await prisma.passwordResetOTP.findFirst({
    where: { email: `verify:${dbUser.email}`, otp, used: false },
    orderBy: { createdAt: "desc" },
  })

  if (!record) return NextResponse.json({ error: "Invalid code" }, { status: 400 })
  if (new Date() > record.expiresAt) return NextResponse.json({ error: "Code has expired" }, { status: 400 })

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { emailVerified: new Date() },
  })

  await prisma.passwordResetOTP.update({ where: { id: record.id }, data: { used: true } })

  return NextResponse.json({ success: true })
}