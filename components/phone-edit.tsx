"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Check, Pencil } from "lucide-react"

export function PhoneEdit({ initialPhone }: { initialPhone: string | null }) {
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState(initialPhone ?? "")
  const [saved, setSaved] = useState(!!initialPhone)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setError("")
    setLoading(true)

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setSaved(true)
    setEditing(false)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
      >
        <Phone className="h-3 w-3" />
        {saved && phone ? phone : "Add phone number"}
        <Pencil className="h-2.5 w-2.5" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="10-digit phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="h-7 text-xs w-40"
      />
      <Button size="sm" className="h-7 px-2" onClick={handleSave} disabled={loading}>
        <Check className="h-3 w-3" />
      </Button>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  )
}