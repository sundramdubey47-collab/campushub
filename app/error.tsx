"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Poora error sirf server/monitoring (Sentry) ke logs me jaata hai,
    // user ko sirf ek generic, friendly message dikhta hai
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          We've been notified and are looking into it. Please try again in a moment.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try Again</Button>
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}