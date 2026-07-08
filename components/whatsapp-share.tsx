"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppShare({ text, url }: { text: string; url: string }) {
  const message = encodeURIComponent(`${text}\n\n${url}`)
  const whatsappUrl = `https://wa.me/?text=${message}`

  return (
<a
href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-xs text-[oklch(0.55_0.13_145)] hover:underline flex items-center gap-1"
    >
      <MessageCircle className="h-3 w-3" /> Share
    </a>
  )
}