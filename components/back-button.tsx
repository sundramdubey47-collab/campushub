"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

const ROOT_PAGES = [
  "/dashboard", "/notes", "/notices", "/events", "/marketplace",
  "/rentals", "/lost-found", "/tests", "/ai-assistant", "/premium",
  "/profile", "/timetable", "/attendance", "/chat", "/admin", "/super-admin",
]

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