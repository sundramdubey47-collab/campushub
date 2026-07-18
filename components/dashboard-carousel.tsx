"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Bell,
  FileText,
  Brain,
  ArrowRight,
} from "lucide-react"

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

export function DashboardCarousel({
  collegeName,
}: {
  collegeName: string
}) {
  const [slides, setSlides] = useState<Slide[]>([
    {
      type: "welcome",
      title: "Your Campus. Your Journey.",
      subtitle: "Explore. Learn. Connect.",
    },
  ])

  const [index, setIndex] = useState(0)

  useEffect(() => {
    fetch("/api/dashboard/carousel")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data)
        }
      })
      .catch(console.error)
  }, [])

  function next() {
    setIndex((i) => (i + 1) % slides.length)
  }

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [slides.length])

  const slide = slides[index]
  const Icon = SLIDE_ICONS[slide.type] || Sparkles

  return (
    <div
      className="
        relative
        isolate
        overflow-hidden
        rounded-3xl
        bg-gradient-to-br
        from-[oklch(0.18_0.03_260)]
        via-[oklch(0.28_0.08_285)]
        to-[oklch(0.70_0.17_75)]
        border
        border-white/10
        shadow-2xl
        shadow-black/25

        h-[300px]
        p-7

        flex
        flex-col
      "
    >
      {/* Glow */}
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-yellow-300/20 blur-[90px] -z-10" />

      <div className="absolute -bottom-20 -left-14 h-52 w-52 rounded-full bg-fuchsia-500/20 blur-[90px] -z-10" />

      <div
        className="
          relative
          z-10
          flex-1
          flex
          flex-col
          overflow-hidden
        "
      >
        <span
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-white/20
            bg-white/10
            backdrop-blur-xl
            px-3
            py-1.5
            text-[10px]
            font-semibold
            uppercase
            tracking-widest
            text-white
          "
        >
          <Icon className="h-3 w-3" />
          {slide.subtitle}
        </span>

        <h2
          className="
            mt-4
            min-h-[72px]
            line-clamp-2
            text-3xl
            font-extrabold
            leading-tight
            tracking-tight
            text-white
          "
        >
          {slide.title}
        </h2>
        {slide.description ? (
          <p
            className="
              mt-2
              min-h-[48px]
              max-w-sm
              overflow-hidden
              text-sm
              leading-6
              text-white/80
              line-clamp-2
            "
          >
            {slide.description}
          </p>
        ) : (
          <p
            className="
              mt-2
              min-h-[48px]
              max-w-sm
              overflow-hidden
              text-sm
              leading-6
              text-white/80
              line-clamp-2
            "
          >
            Everything your college life needs, in one place — {collegeName}.
          </p>
        )}

        {/* Button always at bottom */}
        <div className="mt-auto pt-5">
          <Link href={slide.link ?? "/events"}>
            <Button
              className="
                rounded-xl
                bg-white
                font-semibold
                text-black
                shadow-xl
                transition-all
                duration-300
                hover:scale-105
              "
            >
              {slide.link ? "View Details" : "Explore Events"}

              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className="
          relative
          z-20
          mt-5
          flex
          flex-shrink-0
          items-center
          justify-between
        "
      >
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index
                  ? "w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/15
              text-white
              transition
              hover:bg-white/25
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={next}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/15
              text-white
              transition
              hover:bg-white/25
            "
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}




/*"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[oklch(0.32_0.15_278)] p-7 shadow-lg shadow-primary/20 min-h-[240px] flex flex-col justify-between">
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[oklch(0.72_0.15_60)]/20 blur-3xl" />

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

        {slide.link && (
          <Link href={slide.link}>
            <Button className="mt-5 relative bg-white text-primary hover:bg-white/90 shadow-md">
              View Details <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        )}
        {!slide.link && (
          <Link href="/events">
            <Button className="mt-5 relative bg-white text-primary hover:bg-white/90 shadow-md">
              Explore Events <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Navigation }
      <div className="relative flex items-center justify-between mt-4">
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
}  */
