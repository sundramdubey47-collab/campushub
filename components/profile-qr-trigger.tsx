"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DigitalIdCard } from "@/components/digital-id-card"
import { QrCode } from "lucide-react"

export function ProfileQrTrigger() {
  const [qrImage, setQrImage] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/profile/id-card").then((r) => r.json()).then((d) => setQrImage(d.qrImage))
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 h-12 w-12 rounded-lg border bg-white p-1 flex items-center justify-center hover:border-primary transition-colors"
      >
        {qrImage ? <img src={qrImage} alt="My QR" className="w-full h-full" /> : <QrCode className="h-5 w-5 text-muted-foreground" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-transparent border-none shadow-none">
          <DigitalIdCard />
        </DialogContent>
      </Dialog>
    </>
  )
}