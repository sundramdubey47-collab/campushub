import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/phonepe"
import QRCode from "qrcode"
import crypto from "crypto"

export async function POST(req: Request) {
  const receivedChecksum = req.headers.get("x-verify") ?? ""
  const rawBody = await req.text()

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const base64Response = body.response
  const isValid = verifyWebhookSignature(receivedChecksum, base64Response)

  if (!isValid) {
    console.error("PhonePe webhook: signature mismatch — possible fraud attempt")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const decoded = JSON.parse(Buffer.from(base64Response, "base64").toString())
  const { merchantTransactionId, transactionId, state } = decoded.data ?? {}

  if (!merchantTransactionId) {
    return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: { merchantTransactionId },
  })

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 })
  }

  if (state === "COMPLETED") {
    const qrPayload = JSON.stringify({
      registrationId: registration.id,
      merchantTransactionId,
      transactionId,
    })
    const qrCode = crypto.createHash("sha256").update(qrPayload).digest("hex")

    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        paymentStatus: "SUCCESS",
        transactionId,
        qrCode,
      },
    })
  } else {
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { paymentStatus: "FAILED" },
    })
  }

  return NextResponse.json({ success: true })
}