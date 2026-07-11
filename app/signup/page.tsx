"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CampusHubLogo } from "@/components/campushub-logo"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("ref")
const [honeypot, setHoneypot] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypot) {
  return // Bot detected — silently fail without telling it why
}
    setError("")

    if (!agreed) {
      setError("Please agree to the Terms and Privacy Policy to continue")
      return
    }

    setLoading(true)

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, referralCode }),
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
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            {referralCode ? "You've been invited to join CampusHub!" : "Join your campus community today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border rounded-2xl p-6 bg-card shadow-sm">
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {referralCode && (
            <p className="text-xs bg-primary/10 text-primary rounded-lg px-3 py-2 text-center">
              Referral code applied: <strong>{referralCode}</strong>
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="underline text-primary">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="underline text-primary">Privacy Policy</Link>
            </label>
          </div>
<input
  type="text"
  name="website"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  style={{ position: "absolute", left: "-9999px" }}
  tabIndex={-1}
  autoComplete="off"
/>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Continue with Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium underline underline-offset-2">Login</Link>
        </p>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}