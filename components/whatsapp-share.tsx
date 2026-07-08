"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WhatsAppShare({ text, url }: { text: string; url: string }) {
  const message = encodeURIComponent(`${text}\n\n${url}`)
  const whatsappUrl = `https://wa.me/?text=${message}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-[oklch(0.55_0.13_145)] text-[oklch(0.55_0.13_145)] hover:bg-[oklch(0.55_0.13_145/0.1)]"
      >
        <MessageCircle className="h-4 w-4 mr-2" /> Share on WhatsApp
      </Button>
    </a>
  )
}