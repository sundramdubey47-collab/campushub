"use client"

import { useState } from "react"
import { X } from "lucide-react"

type Props = {
  src: string
  alt: string
  ratio?: string // "aspect-square", "aspect-[4/3]" jaisa fixed box (card ke liye)
  natural?: boolean // true => photo apni asli proportion me dikhti hai (poster/notice ke liye)
  maxH?: string // natural mode me max height
  zoom?: boolean // true => tap karne par full-screen khulti hai
  className?: string
}

export function FullImage({
  src,
  alt,
  ratio = "aspect-[4/3]",
  natural = false,
  maxH = "max-h-[75vh]",
  zoom = false,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className={`relative overflow-hidden bg-muted ${natural ? "" : ratio} ${zoom ? "cursor-zoom-in" : ""} ${className}`}
        onClick={zoom ? () => setOpen(true) : undefined}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
        {natural ? (
          <img src={src} alt={alt} className={`relative mx-auto block w-auto max-w-full ${maxH}`} />
        ) : (
          <img src={src} alt={alt} className="relative h-full w-full object-contain" />
        )}
      </div>

      {zoom && open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}