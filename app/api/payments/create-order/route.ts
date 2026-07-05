import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"

const PLAN_PRICES: Record<string, number> = {
  WEEKLY: 49,
  MONTHLY: 149,
  YEARLY: 999,
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User nahi mila" }, { status: 400 })

  const body = await req.json()
  const planType = body.planType as string

  if (!PLAN_PRICES[planType]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const amount = PLAN_PRICES[planType]

  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100, // Razorpay paise me leta hai (₹1 = 100 paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  })

  await prisma.payment.create({
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount,
      planType: planType as any,
      status: "CREATED",
      userId: dbUser.id,
    },
  })

  return NextResponse.json({
    orderId: razorpayOrder.id,
    amount: amount * 100,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}