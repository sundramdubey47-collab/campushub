import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const body = await req.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Payment details missing " }, { status: 400 })
  }

  // Signature verify karo — ye confirm karta hai ki payment asli Razorpay se aaya hai,
  // koi fake request nahi hai
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: "FAILED" },
    })
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
  })

  if (!payment || payment.userId !== dbUser.id) {
    return NextResponse.json({ error: " No Payment record found " }, { status: 400 })
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", razorpayPaymentId: razorpay_payment_id },
  })

  // Premium activate karo
  const durationDays = payment.planType === "WEEKLY" ? 7 : payment.planType === "MONTHLY" ? 30 : 365

  const premiumUntil = new Date()
  premiumUntil.setDate(premiumUntil.getDate() + durationDays)

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { isPremium: true, premiumUntil },
  })

  return NextResponse.json({ success: true })
}