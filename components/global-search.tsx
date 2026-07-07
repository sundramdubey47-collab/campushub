"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Calendar, ShoppingBag, Bell, Package, Brain } from "lucide-react"

type Results = {
  notes: { id: number; title: string }[]
  events: { id: number; title: string }[]
  listings: { id: number; title: string }[]
  notices: { id: number; title: string }[]
  rentals: { id: number; title: string }[]
  tests: { id: number; title: string }[]
}

const SECTIONS = [
  { key: "notes" as const, label: "Resources", icon: FileText, link: (id: number) => `/notes/${id}` },
  { key: "events" as const, label: "Events", icon: Calendar, link: () => `/events` },
  { key: "listings" as const, label: "Marketplace", icon: ShoppingBag, link: (id: number) => `/marketplace/${id}` },
  { key: "notices" as const, label: "Notices", icon: Bell, link: () => `/notices` },
  { key: "rentals" as const, label: "Rentals", icon: Package, link: () => `/rentals` },
  { key: "tests" as const, label: "AI Tests", icon: Brain, link: (id: number) => `/tests/${id}` },
]

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Results | null>(null)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      return
    }
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data)
          setOpen(true)
        })
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasResults = results && SECTIONS.some((s) => results[s.key].length > 0)

  function goTo(path: string) {
    setOpen(false)
    setQuery("")
    router.push(path)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search resources, events, notices, marketplace..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="w-full rounded-lg border bg-muted/40 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-lg border bg-popover shadow-lg">
          {!hasResults ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No results found</p>
          ) : (
            <div className="py-1">
              {SECTIONS.map((section) => {
                const sectionResults = results![section.key]
                if (sectionResults.length === 0) return null
                const Icon = section.icon
                return (
                  <div key={section.key}>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase">{section.label}</p>
                    {sectionResults.map((r) => (
                      <button key={r.id} onClick={() => goTo(section.link(r.id))} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {r.title}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}