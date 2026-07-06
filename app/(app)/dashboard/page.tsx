"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  FileUp, Ticket, Download, Crown, Bell, Calendar,
  FileText, ShoppingBag, Package, Search, MessageCircle,
  Sparkles, ShieldCheck, Zap, Users, ArrowRight, Brain,
} from "lucide-react"

type DashboardData = {
  name: string
  role: string
  isPremium: boolean
  premiumUntil: string | null
  collegeName: string | null
  uploadsCount: number
  couponsCount: number
  downloadsReceived: number
  recentNotices: { id: number; title: string; createdAt: string; isPinned: boolean }[]
  upcomingEvents: { id: number; title: string; eventDate: string }[]
}

const quickLinks = [
  { href: "/notes", label: "Resources", icon: FileText, color: "oklch(0.55 0.15 278)" },
  { href: "/notices", label: "Notices", icon: Bell, color: "oklch(0.6 0.18 25)" },
  { href: "/events", label: "Events", icon: Calendar, color: "oklch(0.72 0.15 60)" },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, color: "oklch(0.55 0.13 145)" },
  { href: "/rentals", label: "Rentals", icon: Package, color: "oklch(0.55 0.15 278)" },
  { href: "/lost-found", label: "Lost & Found", icon: Search, color: "oklch(0.6 0.18 25)" },
  { href: "/tests", label: "AI Tests", icon: Brain, color: "oklch(0.72 0.15 60)" },
  { href: "/ai-assistant", label: "AI Assistant", icon: MessageCircle, color: "oklch(0.55 0.13 145)" },
]

const features = [
  { icon: Zap, title: "Everything in One Place", description: "Notes, notices, events, marketplace, and more — no more juggling ten different apps for college life." },
  { icon: Sparkles, title: "AI That Actually Helps", description: "Get instant answers, generate practice tests, and study smarter with an AI assistant built for students." },
  { icon: Users, title: "Built by Students, for Students", description: "Every feature — from resource sharing to campus marketplace — solves a real problem students face daily." },
  { icon: ShieldCheck, title: "Safe & Verified Community", description: "Your campus, your college — every interaction stays within your verified student community." },
]

const statCards = [
  { key: "uploadsCount", label: "Uploads", icon: FileUp, color: "oklch(0.55 0.15 278)" },
  { key: "downloadsReceived", label: "Downloads", icon: Download, color: "oklch(0.55 0.13 145)" },
  { key: "couponsCount", label: "Coupons", icon: Ticket, color: "oklch(0.72 0.15 60)" },
] as const

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border bg-primary text-primary-foreground p-6 sm:p-10"
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg viewBox="0 0 400 120" className="absolute bottom-0 w-full h-24" preserveAspectRatio="none">
            <rect x="0" y="40" width="50" height="80" fill="currentColor" />
            <rect x="55" y="20" width="40" height="100" fill="currentColor" />
            <rect x="100" y="55" width="60" height="65" fill="currentColor" />
            <rect x="165" y="10" width="35" height="110" fill="currentColor" />
            <rect x="205" y="45" width="50" height="75" fill="currentColor" />
            <rect x="260" y="30" width="45" height="90" fill="currentColor" />
            <rect x="310" y="60" width="40" height="60" fill="currentColor" />
            <rect x="355" y="15" width="45" height="105" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">
              {data.collegeName ?? "CampusHub"}
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Welcome back, {data.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm sm:text-base opacity-85 mt-2">One platform for every part of your college life</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/events">
              <Button variant="secondary" className="whitespace-nowrap">
                Explore Events <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            {!data.isPremium && (
              <Link href="/premium">
                <Button className="bg-[oklch(var(--premium))] text-[oklch(var(--premium-foreground))] hover:opacity-90 whitespace-nowrap">
                  <Crown className="h-4 w-4 mr-1.5" /> Go Premium
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
      >
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.key} className="ch-notebook-line rounded-xl border bg-card p-4 sm:p-5 space-y-2">
              <div className="rounded-lg p-2 w-fit" style={{ backgroundColor: `${s.color}1f` }}>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">{data[s.key as keyof DashboardData] as number}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
        <div className="ch-notebook-line rounded-xl border bg-card p-4 sm:p-5 space-y-2">
          <div className="rounded-lg p-2 w-fit" style={{ backgroundColor: "oklch(var(--premium)/0.15)" }}>
            <Crown className="h-4 w-4" style={{ color: "oklch(var(--premium))" }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight">{data.isPremium ? "Premium" : "Free"}</p>
          <p className="text-xs text-muted-foreground">Your Plan</p>
        </div>
      </motion.div>

      {/* Quick Access */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm sm:text-base">Quick Access</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
          {quickLinks.map((link, i) => {
            const Icon = link.icon
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.04 * i }}
              >
                <Link
                  href={link.href}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border bg-card p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="rounded-lg p-1.5" style={{ backgroundColor: `${link.color}1f` }}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: link.color }} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{link.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Notices + Events bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="ch-notebook-line rounded-xl border bg-card p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" /> Recent Notices
            </h2>
            <Link href="/notices" className="text-xs text-primary underline">View all</Link>
          </div>
          {data.recentNotices.length === 0 ? (
            <EmptyState icon={Bell} title="No notices yet" />
          ) : (
            <div className="space-y-1">
              {data.recentNotices.map((n) => (
                <Link key={n.id} href="/notices" className="block text-sm p-2 rounded-lg hover:bg-muted truncate">
                  {n.isPinned && "📌 "}{n.title}
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="ch-notebook-line rounded-xl border bg-card p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Upcoming Events
            </h2>
            <Link href="/events" className="text-xs text-primary underline">View all</Link>
          </div>
          {data.upcomingEvents.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming events" />
          ) : (
            <div className="space-y-1">
              {data.upcomingEvents.map((e) => (
                <Link key={e.id} href="/events" className="block text-sm p-2 rounded-lg hover:bg-muted truncate">
                  {e.title} — {new Date(e.eventDate).toLocaleDateString()}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Premium showcase (only if not premium) */}
      {!data.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-2xl border border-[oklch(var(--premium)/0.4)] bg-gradient-to-r from-[oklch(var(--premium)/0.1)] to-transparent p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[oklch(var(--premium)/0.2)] p-2.5 shrink-0">
                <Crown className="h-5 w-5 text-[oklch(var(--premium))]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Unlock the full CampusHub experience</p>
                <p className="text-xs text-muted-foreground">Unlimited downloads, premium tests, and more — starting at ₹49/week</p>
              </div>
            </div>
            <Link href="/premium">
              <Button className="bg-[oklch(var(--premium))] text-[oklch(var(--premium-foreground))] hover:opacity-90 whitespace-nowrap shrink-0">
                View Plans <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Why Choose CampusHub */}
      <div className="space-y-4 pt-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Why Choose CampusHub?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Built to be the one app every student on your campus actually wants to open every day
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="rounded-xl border bg-card p-5 space-y-2"
              >
                <div className="rounded-lg bg-primary/10 p-2.5 w-fit">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 mt-8 border-t space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-sm">CampusHub</p>
            <p className="text-xs text-muted-foreground">One Platform For Every College Student</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/notes" className="hover:text-foreground">Resources</Link>
            <Link href="/events" className="hover:text-foreground">Events</Link>
            <Link href="/premium" className="hover:text-foreground">Premium</Link>
            <Link href="/ai-assistant" className="hover:text-foreground">AI Assistant</Link>
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} CampusHub. Made with ❤️ for students, by students.
        </p>
      </footer>
    </div>
  )
}