"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { MessageSquarePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function FeedbackButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyGiven, setAlreadyGiven] = useState(true)

  useEffect(() => {
    const given = localStorage.getItem(`ch_feedback_given:${pathname}`)
    setAlreadyGiven(!!given)
  }, [pathname])

  async function handleSubmit() {
    if (!message.trim()) return
    setLoading(true)

    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, page: pathname }),
    })

    setLoading(false)
    setSubmitted(true)
    setMessage("")
    localStorage.setItem(`ch_feedback_given:${pathname}`, "true")

    setTimeout(() => {
      setSubmitted(false)
      setOpen(false)
      setAlreadyGiven(true)
    }, 1500)
  }

  if (alreadyGiven) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-4">
      {open ? (
        <div className="w-72 rounded-xl border bg-card shadow-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">Got feedback for this page?</p>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {submitted ? (
            <p className="text-sm text-[oklch(var(--success))]">Thanks! We'll take a look 🙏</p>
          ) : (
            <>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <Button size="sm" className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending..." : "Send Feedback"}
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button size="icon" className="rounded-full h-12 w-12 shadow-lg" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}