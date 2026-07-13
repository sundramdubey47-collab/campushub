"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CampusHubLogo } from "@/components/campushub-logo"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp" | "password">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setStep("otp")
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/forgot-password/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setStep("password")
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/login")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-muted/20">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <CampusHubLogo className="h-10 w-10" />
          <h1 className="text-xl font-bold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "password" && "Choose your new password"}
          </p>
        </div>

        <div className="border rounded-2xl p-6 bg-card shadow-sm">
          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>6-Digit Code</Label>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-medium underline underline-offset-2">Login</Link>
        </p>
      </div>
    </main>
  )
}