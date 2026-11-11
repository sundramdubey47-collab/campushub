"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Loader2 } from "lucide-react"
import { ImageCropModal } from "@/components/image-crop-modal"

const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

export function AvatarEdit({ initialUrl, initials }: { initialUrl: string | null; initials: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [avatarUrl, setAvatarUrl] = useState(initialUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cropFile, setCropFile] = useState<File | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("")
    const picked = e.target.files?.[0]
    e.target.value = ""
    if (!picked) return

    if (!ALLOWED.includes(picked.type)) {
      setError("only JPG, PNG or WebP photo ")
      return
    }
    setCropFile(picked)
  }

  async function uploadCropped(file: File) {
    setError("")
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Could not update photo")
        return
      }

      setAvatarUrl(data.avatarUrl)
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-16 w-16 shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {initials}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        aria-label="Change profile photo"
        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-card shadow-sm transition-colors hover:bg-muted"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3 w-3" />}
      </button>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />

      {error && <p className="absolute left-0 top-full mt-1 w-40 text-[10px] text-red-500">{error}</p>}

      <ImageCropModal
        file={cropFile}
        open={cropFile !== null}
        shape="round"
        onClose={() => setCropFile(null)}
        onCropped={uploadCropped}
      />
    </div>
  )
}