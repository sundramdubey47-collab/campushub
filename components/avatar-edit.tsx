"use client"

import { useRef, useState } from "react"
import { Pencil, Loader2 } from "lucide-react"

export function AvatarEdit({ initialUrl, initials }: { initialUrl: string | null; initials: string }) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/profile/avatar", { method: "POST", body: formData })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setAvatarUrl(data.avatarUrl)
  }

  return (
    <div className="relative h-16 w-16 shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card border-2 border-background flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3 w-3" />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="absolute top-full mt-1 text-[10px] text-red-500 whitespace-nowrap">{error}</p>}
    </div>
  )
}