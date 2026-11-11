"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeleteNoteButton({ id, title }: { id: number; title: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function remove() {
    if (!confirm(`"${title}" Are you sure you want to delete this item? This action cannot be undone..`)) return
    setError("")
    setBusy(true)

    const res = await fetch(`/api/notes/${id}/remove`, { method: "DELETE" })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(data.error || "Could not delete")
      return
    }
    router.refresh()
  }

  return (
    <div className="shrink-0">
      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={remove} disabled={busy} aria-label="Delete resource">
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <p className="max-w-[140px] text-[10px] text-red-500">{error}</p>}
    </div>
  )
}