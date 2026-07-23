"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from "lucide-react"

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
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0 })

  const previewUrl = file ? URL.createObjectURL(file) : ""

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }

  function handlePointerUp() {
    setDragging(false)
  }

  async function handleCrop() {
    if (!imgRef.current || !containerRef.current || !file) return

    const CROP_SIZE = 500
    const canvas = document.createElement("canvas")
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current.getBoundingClientRect()
    const img = imgRef.current

    const scaleX = img.naturalWidth / (img.width * zoom)
    const scaleY = img.naturalHeight / (img.height * zoom)

    const sx = ((container.width / 2 - offset.x - (img.width * zoom) / 2) * -1) * scaleX
    const sy = ((container.height / 2 - offset.y - (img.height * zoom) / 2) * -1) * scaleY
    const sSize = container.width * scaleX

    ctx.drawImage(img, Math.max(0, sx), Math.max(0, sy), sSize, sSize, 0, 0, CROP_SIZE, CROP_SIZE)

    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedFile = new File([blob], file.name, { type: "image/jpeg" })
      onCropped(croppedFile)
      onClose()
    }, "image/jpeg", 0.9)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative w-full aspect-square overflow-hidden rounded-xl border bg-muted touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {previewUrl && (
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Crop preview"
              draggable={false}
              className="absolute select-none"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                maxWidth: "none",
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleCrop}>Use Photo</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}