import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkPhonePeStatus } from "@/lib/phonepe"
import QRCode from "qrcode"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ merchantTransactionId: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { merchantTransactionId } = await params

  const registration = await prisma.eventRegistration.findUnique({
    where: { merchantTransactionId },
    include: { event: { select: { title: true } } },
  })

  if (!registration || registration.userId !== dbUser.id) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 })
  }

  // Agar webhook abhi tak nahi aaya, fallback: PhonePe se directly poochte hain
  if (registration.paymentStatus === "PENDING") {
    const statusResponse = await checkPhonePeStatus(merchantTransactionId)
    if (statusResponse.code === "PAYMENT_SUCCESS") {
      const crypto = await import("crypto")
      const qrPayload = JSON.stringify({
        registrationId: registration.id,
        merchantTransactionId,
        transactionId: statusResponse.data?.transactionId,
      })
      const qrCode = crypto.createHash("sha256").update(qrPayload).digest("hex")

      await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: {
          paymentStatus: "SUCCESS",
          transactionId: statusResponse.data?.transactionId,
          qrCode,
        },
      })
      registration.paymentStatus = "SUCCESS"
    } else if (statusResponse.code === "PAYMENT_ERROR") {
      await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { paymentStatus: "FAILED" },
      })
      registration.paymentStatus = "FAILED"
    }
  }

  let qrImage = null
  if (registration.paymentStatus === "SUCCESS") {
    qrImage = await QRCode.toDataURL(registration.qrCode)
  }

  return NextResponse.json({
    status: registration.paymentStatus,
    eventTitle: registration.event.title,
    qrImage,
  })
}