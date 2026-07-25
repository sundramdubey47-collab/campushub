"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function PaymentStatusPage() {
  const params = useParams()
  const router = useRouter()
  const merchantTransactionId = params.merchantTransactionId as string

  const [status, setStatus] = useState("PENDING")
  const [eventTitle, setEventTitle] = useState("")
  const [qrImage, setQrImage] = useState<string | null>(null)

  useEffect(() => {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const res = await fetch(`/api/payment/status/${merchantTransactionId}`)
      const data = await res.json()

      setStatus(data.status)
      setEventTitle(data.eventTitle)
      if (data.qrImage) setQrImage(data.qrImage)

      if (data.status === "SUCCESS" || data.status === "FAILED" || attempts > 20) {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [merchantTransactionId])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center space-y-4">
      {status === "PENDING" && (
        <>
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="font-semibold">Confirming your payment...</p>
          <p className="text-sm text-muted-foreground">This usually takes a few seconds</p>
        </>
      )}

      {status === "SUCCESS" && (
        <>
          <CheckCircle2 className="h-10 w-10 text-[oklch(var(--success))]" />
          <p className="font-semibold">Payment Successful! 🎉</p>
          <p className="text-sm text-muted-foreground">You're registered for {eventTitle}</p>
          {qrImage && <img src={qrImage} alt="QR" className="w-40 h-40 rounded-lg border mt-2" />}
          <Button onClick={() => router.push("/events")}>Go to Events</Button>
        </>
      )}

      {status === "FAILED" && (
        <>
          <XCircle className="h-10 w-10 text-red-500" />
          <p className="font-semibold">Payment Failed</p>
          <p className="text-sm text-muted-foreground">Please try registering again</p>
          <Button onClick={() => router.push("/events")}>Back to Events</Button>
        </>
      )}
    </div>
  )
}