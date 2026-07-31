"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { ROOT_PAGES } from "@/components/show-on-root-page"

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()

  if (ROOT_PAGES.includes(pathname)) return null

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
  )
}