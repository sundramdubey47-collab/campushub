import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      referralCode: true,
      referrals: { select: { id: true, name: true, createdAt: true, collegeId: true } },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const successfulReferrals = user.referrals.filter((r) => r.collegeId !== null).length

  return NextResponse.json({
    referralCode: user.referralCode,
    totalInvited: user.referrals.length,
    successfulReferrals,
  })
}