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
  const [previewUrl, setPreviewUrl] = useState("")
  const [imgLoaded, setImgLoaded] = useState(false)
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, size: 200 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setImgLoaded(false)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  function handleImageLoad() {
    if (!containerRef.current) return
    const container = containerRef.current.getBoundingClientRect()
    const size = Math.min(container.width, container.height) * 0.7
    setCropBox({
      x: (container.width - size) / 2,
      y: (container.height - size) / 2,
      size,
    })
    setImgLoaded(true)
  }

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, boxX: cropBox.x, boxY: cropBox.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !containerRef.current) return
    const container = containerRef.current.getBoundingClientRect()
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y

    let newX = dragStart.current.boxX + dx
    let newY = dragStart.current.boxY + dy

    newX = Math.max(0, Math.min(newX, container.width - cropBox.size))
    newY = Math.max(0, Math.min(newY, container.height - cropBox.size))

    setCropBox((prev) => ({ ...prev, x: newX, y: newY }))
  }

  function handlePointerUp() {
    setDragging(false)
  }

  function handleResize(delta: number) {
    if (!containerRef.current) return
    const container = containerRef.current.getBoundingClientRect()
    const maxSize = Math.min(container.width, container.height)
    setCropBox((prev) => {
      const newSize = Math.max(80, Math.min(prev.size + delta, maxSize))
      const newX = Math.min(prev.x, container.width - newSize)
      const newY = Math.min(prev.y, container.height - newSize)
      return { x: Math.max(0, newX), y: Math.max(0, newY), size: newSize }
    })
  }

  async function handleCrop() {
    if (!imgRef.current || !containerRef.current || !file) return

   const OUTPUT_SIZE = 1000
    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imgRef.current
    const displayedW = img.width
    const displayedH = img.height
    const scaleX = img.naturalWidth / displayedW
    const scaleY = img.naturalHeight / displayedH

    const sx = cropBox.x * scaleX
    const sy = cropBox.y * scaleY
    const sSize = cropBox.size * scaleX

    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })
      onCropped(croppedFile)
      onClose()
    }, "image/jpeg", 0.95)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative w-full aspect-square overflow-hidden rounded-xl bg-black touch-none select-none"
        >
          {previewUrl && (
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Crop source"
              onLoad={handleImageLoad}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          )}

          {imgLoaded && (
            <>
              {/* Dark overlay outside crop box */}
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `0 0 0 9999px rgba(0,0,0,0.6)`, clipPath: `polygon(evenodd)` }} />
              {/* Crop box */}
              <div
                className="absolute border-2 border-white cursor-move"
                style={{
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.size,
                  height: cropBox.size,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {/* Grid lines, jaise Google Photos me dikhते hain */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>
                {/* Corner resize handles */}
                <div className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full bg-white border-2 border-primary" />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => handleResize(-20)}>Smaller</Button>
          <Button variant="outline" size="sm" onClick={() => handleResize(20)}>Bigger</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleCrop} disabled={!imgLoaded}>Crop & Use</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}