"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("ch_cookie_consent")
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem("ch_cookie_consent", "accepted")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3 justify-between">
        <p className="text-xs text-muted-foreground">
          We use essential cookies to keep you logged in, and analytics cookies to improve CampusHub. By using this site, you agree to our{" "}
          <Link href="/privacy" className="underline text-primary">Privacy Policy</Link>.
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">Got it</Button>
      </div>
    </div>
  )
}