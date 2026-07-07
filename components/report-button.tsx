"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function ReportButton({ type, targetId }: { type: string; targetId: number }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!reason.trim()) return
    setLoading(true)

    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, targetId, reason }),
    })

    setLoading(false)
    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setReason("")
    }, 1200)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
          <Flag className="h-3 w-3" /> Report
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this item</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <p className="text-sm text-[oklch(var(--success))]">Thanks for reporting. Our team will review it.</p>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="What's wrong with this listing?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}