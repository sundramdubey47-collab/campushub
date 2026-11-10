"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { optimizedUrl } from "@/lib/cdn"

type Props = {
  src: string
  alt: string
  ratio?: string
  natural?: boolean
  maxH?: string
  zoom?: boolean
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
  const display = optimizedUrl(src, 1000)
  const big = optimizedUrl(src, 1800)

  return (
    <>
      <div
        className={`relative overflow-hidden bg-muted ${natural ? "" : ratio} ${zoom ? "cursor-zoom-in" : ""} ${className}`}
        onClick={zoom ? () => setOpen(true) : undefined}
      >
        <img
          src={display}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
        {natural ? (
          <img src={display} alt={alt} loading="lazy" decoding="async" className={`relative mx-auto block w-auto max-w-full ${maxH}`} />
        ) : (
          <img src={display} alt={alt} loading="lazy" decoding="async" className="relative h-full w-full object-contain" />
        )}
      </div>

      {zoom && open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setOpen(false)}>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={big} alt={alt} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}