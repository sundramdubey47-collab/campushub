"use client"

import { useEffect, useState } from "react"
import { UserX, UserCheck } from "lucide-react"

export function BlockUserButton({ targetUserId }: { targetUserId: number }) {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    fetch("/api/block-user")
      .then((r) => r.json())
      .then((list) => setBlocked(list.some((b: any) => b.blocked.id === targetUserId)))
  }, [targetUserId])

  async function toggle() {
    const res = await fetch("/api/block-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    })
    const data = await res.json()
    setBlocked(data.blocked)
  }

  return (
    <button onClick={toggle} className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
      {blocked ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
      {blocked ? "Unblock" : "Block"}
    </button>
  )
}