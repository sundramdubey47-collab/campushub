"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"

export default function ScanPage() {
  const params = useParams()
  const eventId = params.id
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [message, setMessage] = useState("")
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader")
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await handleScan(decodedText)
        },
        () => {}
      )
      .then(() => setScanning(true))
      .catch((err) => setMessage("Camera nahi khul paya: " + err))

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  async function handleScan(qrCode: string) {
    const res = await fetch(`/api/events/${eventId}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage("❌ " + data.error)
    } else {
      setMessage(`✅ ${data.name} ki attendance lag gayi`)
    }

    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">QR Scanner</h1>
      <p className="text-sm text-muted-foreground">
        Student ka QR code camera ke saamne rakho
      </p>

      <div id="qr-reader" className="w-full" />

      {message && (
        <p className="text-center font-medium p-2 border rounded-lg">{message}</p>
      )}
    </div>
  )
}