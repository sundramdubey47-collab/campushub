"use client"

import { useEffect, useRef, useState } from "react"
import { ImageCropModal } from "@/components/image-crop-modal"
import { resizeKeepAspect } from "@/lib/image-utils"
import { Crop, ImagePlus, X } from "lucide-react"

const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

function Thumb({ file, onCrop, onRemove }: { file: File; onCrop: () => void; onRemove: () => void }) {
  const [url, setUrl] = useState("")

  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {url && <img src={url} alt="" className="h-full w-full object-contain" />}
      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/70 to-transparent p-1">
        <button type="button" onClick={onCrop} className="rounded bg-white/20 p-1 text-white hover:bg-white/30" title="Crop">
          <Crop className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={onRemove} className="rounded bg-white/20 p-1 text-white hover:bg-white/30" title="Remove">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function MultiImagePicker({
  files,
  onChange,
  max = 5,
}: {
  files: File[]
  onChange: (files: File[]) => void
  max?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropIndex, setCropIndex] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError("")
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (picked.length === 0) return

    const room = max === 1 ? 1 : max - files.length
    const valid = picked.filter((f) => ALLOWED.includes(f.type)).slice(0, Math.max(room, 0))

    if (valid.length < picked.length) {
      setError(`Sirf JPG, PNG ya WebP photo allowed hai (max ${max}).`)
    }
    if (valid.length === 0) return

    setBusy(true)
    const processed = await Promise.all(valid.map((f) => resizeKeepAspect(f)))
    setBusy(false)

    onChange(max === 1 ? processed.slice(0, 1) : [...files, ...processed])
  }

  const canAddMore = max === 1 || files.length < max

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={max > 1} className="hidden" onChange={handleSelect} />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {files.map((f, i) => (
          <Thumb
            key={`${f.name}-${i}`}
            file={f}
            onCrop={() => setCropIndex(i)}
            onRemove={() => onChange(files.filter((_, idx) => idx !== i))}
          />
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            {busy ? "Processing..." : max === 1 && files.length ? "Change" : "Add photo"}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-[11px] text-muted-foreground">
        Poori photo jaisi hai waisi hi upload hoti hai. Crop chahiye to thumbnail par crop icon dabao.
      </p>

      <ImageCropModal
        file={cropIndex !== null ? files[cropIndex] ?? null : null}
        open={cropIndex !== null}
        onClose={() => setCropIndex(null)}
        onCropped={(cropped) => {
          if (cropIndex === null) return
          onChange(files.map((f, i) => (i === cropIndex ? cropped : f)))
        }}
      />
    </div>
  )
}