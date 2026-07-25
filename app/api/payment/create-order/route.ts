import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createPhonePeOrder, generateMerchantTransactionId } from "@/lib/phonepe"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const body = await req.json()
  const { eventId } = body

  const event = await prisma.event.findUnique({ where: { id: Number(eventId) } })
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  if (event.paymentType !== "ONLINE_PHONEPE" || !event.feeAmount) {
    return NextResponse.json({ error: "This event doesn't use online payment" }, { status: 400 })
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId: dbUser.id, eventId: event.id } },
  })
  if (existing && existing.paymentStatus === "SUCCESS") {
    return NextResponse.json({ error: "You're already registered for this event" }, { status: 400 })
  }

  const merchantTransactionId = generateMerchantTransactionId(event.id, dbUser.id)
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/status/${merchantTransactionId}`

  const phonepeResponse = await createPhonePeOrder({
    merchantTransactionId,
    amount: event.feeAmount,
    userId: dbUser.id,
    redirectUrl,
  })

  if (!phonepeResponse.success) {
    return NextResponse.json({ error: "Could not initiate payment. Please try again." }, { status: 500 })
  }

  // Registration ko PENDING state me create/update karte hain, QR abhi nahi generate hota
  const crypto = await import("crypto")
  const tempQr = crypto.randomBytes(16).toString("hex")

  if (existing) {
    await prisma.eventRegistration.update({
      where: { id: existing.id },
      data: {
        merchantTransactionId,
        paymentStatus: "PENDING",
        amount: event.feeAmount,
      },
    })
  } else {
    await prisma.eventRegistration.create({
      data: {
        userId: dbUser.id,
        eventId: event.id,
        qrCode: tempQr,
        merchantTransactionId,
        paymentStatus: "PENDING",
        amount: event.feeAmount,
      },
    })
  }

  const paymentUrl = phonepeResponse.data?.instrumentResponse?.redirectInfo?.url

  return NextResponse.json({ paymentUrl, merchantTransactionId })
}