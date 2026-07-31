"use client"

import { usePathname } from "next/navigation"

export const ROOT_PAGES = [
  "/dashboard", "/notes", "/notices", "/events", "/marketplace",
  "/rentals", "/lost-found", "/tests", "/ai-assistant", "/premium",
  "/profile", "/timetable", "/attendance", "/chat", "/admin", "/super-admin",
]

export function ShowOnRootPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (!ROOT_PAGES.includes(pathname)) return null
  return <>{children}</>
}