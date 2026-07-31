"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Sparkles, Calendar, Bell, FileText, Brain, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Slide = {
  type: string
  title: string
  subtitle: string
  description?: string | null
  link?: string
  date?: string
}

const SLIDE_ICONS: Record<string, any> = {
  welcome: Sparkles,
  event: Calendar,
  notice: Bell,
  resource: FileText,
  ai: Brain,
}

export function DashboardCarousel({ collegeName }: { collegeName: string }) {
  const router = useRouter()
  const [slides, setSlides] = useState<Slide[]>([{ type: "welcome", title: "Your Campus. Your Journey.", subtitle: "Explore. Learn. Connect." }])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    fetch("/api/dashboard/carousel")
      .then((r) => r.json())
      .then((data) => {
        if (data.length > 0) setSlides(data)
      })
  }, [])

  function next() {
    setIndex((i) => (i + 1) % slides.length)
  }

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  const slide = slides[index]
  const Icon = SLIDE_ICONS[slide.type] || Sparkles
  const targetLink = slide.link || "/events"

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.15_278)] p-7 shadow-lg shadow-primary/20 min-h-[240px] flex flex-col justify-between cursor-pointer"
      onClick={() => router.push(targetLink)}
    >
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[oklch(0.72_0.15_60)]/20 blur-3xl pointer-events-none" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/90 bg-white/15 px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm">
          <Icon className="h-3 w-3" /> {slide.subtitle}
        </span>
        <h2 className="text-2xl font-bold mt-3 text-white tracking-tight">{slide.title}</h2>
        {slide.description && (
          <p className="text-sm text-white/75 mt-1.5 max-w-xs line-clamp-2">{slide.description}</p>
        )}
        {!slide.description && slide.type === "welcome" && (
          <p className="text-sm text-white/75 mt-1.5 max-w-xs">
            Everything your college life needs, in one place — {collegeName}.
          </p>
        )}

        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium bg-white text-primary px-4 py-2 rounded-full shadow-md">
          View Details <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Navigation — clicks yahan se bubble na hon isliye stopPropagation */}
      <div className="relative flex items-center justify-between mt-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}