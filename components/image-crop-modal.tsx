"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { resizeKeepAspect } from "@/lib/image-utils"

type Rect = { x: number; y: number; w: number; h: number }

const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
]

const MIN_SIZE = 60
const MAX_OUTPUT_SIDE = 1600

export function ImageCropModal({
  file,
  open,
  onClose,
  onCropped,
}: {
  file: File | null
  open: boolean
  onClose: () => void
  onCropped: (cropped: File) => void
}) {
  const [previewUrl, setPreviewUrl] = useState("")
  const [imgRect, setImgRect] = useState<Rect | null>(null)
  const [box, setBox] = useState<Rect | null>(null)
  const [aspect, setAspect] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ mode: "move" | "resize"; startX: number; startY: number; box: Rect } | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl("")
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setImgRect(null)
    setBox(null)
    setAspect(null)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleImageLoad() {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return

    const cw = container.clientWidth
    const ch = container.clientHeight
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    const rect = { x: (cw - w) / 2, y: (ch - h) / 2, w, h }

    setImgRect(rect)
    setBox({ x: rect.x + w * 0.08, y: rect.y + h * 0.08, w: w * 0.84, h: h * 0.84 })
  }

  function applyAspect(value: number | null) {
    setAspect(value)
    if (!imgRect) return

    if (value === null) {
      setBox({
        x: imgRect.x + imgRect.w * 0.08,
        y: imgRect.y + imgRect.h * 0.08,
        w: imgRect.w * 0.84,
        h: imgRect.h * 0.84,
      })
      return
    }

    let w = imgRect.w * 0.84
    let h = w / value
    if (h > imgRect.h * 0.84) {
      h = imgRect.h * 0.84
      w = h * value
    }
    setBox({ x: imgRect.x + (imgRect.w - w) / 2, y: imgRect.y + (imgRect.h - h) / 2, w, h })
  }

  function startDrag(e: React.PointerEvent, mode: "move" | "resize") {
    if (!box) return
    e.preventDefault()
    e.stopPropagation()
    containerRef.current?.setPointerCapture(e.pointerId)
    drag.current = { mode, startX: e.clientX, startY: e.clientY, box }
  }

  function handlePointerMove(e: React.PointerEvent) {
    const d = drag.current
    const container = containerRef.current
    if (!d || !imgRect || !container) return

    if (d.mode === "move") {
      const x = Math.max(imgRect.x, Math.min(d.box.x + (e.clientX - d.startX), imgRect.x + imgRect.w - d.box.w))
      const y = Math.max(imgRect.y, Math.min(d.box.y + (e.clientY - d.startY), imgRect.y + imgRect.h - d.box.h))
      setBox({ ...d.box, x, y })
      return
    }

    const bounds = container.getBoundingClientRect()
    const px = e.clientX - bounds.left
    const py = e.clientY - bounds.top
    const right = imgRect.x + imgRect.w
    const bottom = imgRect.y + imgRect.h

    let w = Math.max(MIN_SIZE, Math.min(px - d.box.x, right - d.box.x))
    let h: number

    if (aspect) {
      h = w / aspect
      if (d.box.y + h > bottom) {
        h = bottom - d.box.y
        w = h * aspect
      }
    } else {
      h = Math.max(MIN_SIZE, Math.min(py - d.box.y, bottom - d.box.y))
    }

    setBox({ x: d.box.x, y: d.box.y, w, h })
  }

  function endDrag() {
    drag.current = null
  }

  function handleCrop() {
    const img = imgRef.current
    if (!img || !imgRect || !box || !file) return
    setBusy(true)

    const scale = img.naturalWidth / imgRect.w
    const sx = (box.x - imgRect.x) * scale
    const sy = (box.y - imgRect.y) * scale
    const sw = box.w * scale
    const sh = box.h * scale

    const outScale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(sw, sh))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(sw * outScale))
    canvas.height = Math.max(1, Math.round(sh * outScale))

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setBusy(false)
      return
    }

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        setBusy(false)
        if (!blob) return
        onCropped(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }))
        onClose()
      },
      "image/jpeg",
      0.92
    )
  }

  async function handleUseFull() {
    if (!file) return
    setBusy(true)
    const full = await resizeKeepAspect(file)
    setBusy(false)
    onCropped(full)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative h-72 w-full touch-none select-none overflow-hidden rounded-xl bg-black sm:h-80"
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {previewUrl && (
            <img
              ref={imgRef}
              src={previewUrl}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            />
          )}

          {box && (
            <div
              className="absolute cursor-move border-2 border-white"
              style={{
                left: box.x,
                top: box.y,
                width: box.w,
                height: box.h,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
              }}
              onPointerDown={(e) => startDrag(e, "move")}
            >
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/25" />
                ))}
              </div>
              <div
                className="absolute bottom-0 right-0 flex h-8 w-8 cursor-nwse-resize items-end justify-end"
                onPointerDown={(e) => startDrag(e, "resize")}
              >
                <span className="h-4 w-4 rounded-sm border-2 border-primary bg-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ASPECTS.map((a) => (
            <button
              type="button"
              key={a.label}
              onClick={() => applyAspect(a.value)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                aspect === a.value ? "border-primary bg-primary text-primary-foreground" : "bg-card"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Box ko drag karke move karo, neeche-right corner se size badlo. Crop nahi karna to "Use Full Photo" dabao,
          poori photo jaisi hai waisi hi jaayegi.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleUseFull} disabled={busy}>
            Use Full Photo
          </Button>
          <Button type="button" size="sm" onClick={handleCrop} disabled={busy || !box}>
            Crop & Use
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}