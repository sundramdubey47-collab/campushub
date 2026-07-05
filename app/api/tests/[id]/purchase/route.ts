import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"
import crypto from "crypto"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User nahi mila" }, { status: 400 })

  const { id } = await params
  const test = await prisma.test.findUnique({ where: { id: Number(id) } })

  if (!test || !test.isPremium || !test.price) {
    return NextResponse.json({ error: "Ye test purchase karne wala nahi hai" }, { status: 400 })
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: test.price * 100,
    currency: "INR",
    receipt: `test_${test.id}_${Date.now()}`,
  })

  return NextResponse.json({
    orderId: razorpayOrder.id,
    amount: test.price * 100,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}