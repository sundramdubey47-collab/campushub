"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailCheck } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function sendCode() {
    setError("")
    setLoading(true)
    const res = await fetch("/api/verify-email/send", { method: "POST" })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setSent(true)
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/verify-email/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push("/dashboard")
  }

  return (
    <div className="max-w-sm mx-auto space-y-6 pt-10 text-center">
      <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto">
        <MailCheck className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold">Verify your email</h1>
        <p className="text-sm text-muted-foreground mt-1">Help us confirm it's really you</p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!sent ? (
        <Button onClick={sendCode} disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send Verification Code"}
        </Button>
      ) : (
        <form onSubmit={confirmCode} className="space-y-3">
          <Input placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <button type="button" onClick={sendCode} className="text-xs text-primary underline">
            Resend Code
          </button>
        </form>
      )}

      <button onClick={() => router.push("/dashboard")} className="text-xs text-muted-foreground underline">
        Skip for now
      </button>
    </div>
  )
}