
"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { unregisterThisDevice } from "@/lib/push"

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await unregisterThisDevice()
    } catch (error) {
      console.error("Device unregister failed:", error)
    }

    await signOut({ callbackUrl: "/login" })
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  )
}
