"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CampusHubLogo } from "@/components/campushub-logo"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setLoading(true)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError("Invalid email or password")
      return
    }

    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/10 via-background to-muted">

      <div className="w-full max-w-md space-y-7">

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3">

          <div className="rounded-2xl bg-background p-3 shadow-md">
            <CampusHubLogo className="h-12 w-12" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back 👋
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Login to continue your CampusHub journey
            </p>
          </div>

        </div>


        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border bg-card/80 backdrop-blur p-7 shadow-xl"
        >

          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-500">
              {error}
            </div>
          )}


          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>
                    <div className="space-y-2">
            <Label htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>


          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>


          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl text-sm font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>


          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">
                OR
              </span>
            </div>
          </div>


          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl"
            onClick={() =>
              signIn("google", {
                callbackUrl:"/dashboard"
              })
            }
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M21.35 12.27c0-.75-.07-1.47-.21-2.16H12v4.09h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.29Z"
              />
            </svg>

            Continue with Google
          </Button>

        </form>


        <p className="text-center text-sm text-muted-foreground">

          Don't have an account?{" "}

          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Create account
          </Link>

        </p>


      </div>

    </main>
  )
}