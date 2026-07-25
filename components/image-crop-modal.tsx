"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
  const [zoom, setZoom] = useState(100)
  const [previewUrl, setPreviewUrl] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setZoom(100)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  async function handleCrop() {
    if (!imgRef.current || !file) return

    const OUTPUT_SIZE = 600
    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imgRef.current
    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight
    const minSide = Math.min(naturalW, naturalH)

    // Zoom 100 = poora minSide use hota hai (no zoom), zoom 200 = aadha area (2x zoom-in)
    const cropSide = minSide / (zoom / 100)
    const sx = (naturalW - cropSide) / 2
    const sy = (naturalH - cropSide) / 2

    ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })
      onCropped(croppedFile)
      onClose()
    }, "image/jpeg", 0.92)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative w-full aspect-square overflow-hidden rounded-xl border bg-muted"
        >
          {previewUrl && (
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Crop preview"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
            />
          )}
          {/* Crop frame overlay */}
          <div className="absolute inset-0 border-2 border-white/80 pointer-events-none" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)" }} />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Zoom</p>
          <input
            type="range"
            min="100"
            max="250"
            step="5"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleCrop}>Use Photo</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}