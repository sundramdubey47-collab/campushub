"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { StatCard } from "@/components/stat-card"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  FileUp, Ticket, Download, Crown, Bell, Calendar,
  FileText, ShoppingBag, Package, Search, MessageCircle,
  Sparkles, ShieldCheck, Zap, Users, ArrowRight,
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
  { href: "/notes", label: "Resources", icon: FileText },
  { href: "/notices", label: "Notices", icon: Bell },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/rentals", label: "Rentals", icon: Package },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/ai-assistant", label: "AI Assistant", icon: MessageCircle },
]

const features = [
  {
    icon: Zap,
    title: "Everything in One Place",
    description: "Notes, notices, events, marketplace, and more — no more juggling ten different apps for college life.",
  },
  {
    icon: Sparkles,
    title: "AI That Actually Helps",
    description: "Get instant answers, generate practice tests, and study smarter with an AI assistant built for students.",
  },
  {
    icon: Users,
    title: "Built by Students, for Students",
    description: "Every feature — from resource sharing to campus marketplace — solves a real problem students face daily.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Verified Community",
    description: "Your campus, your college — every interaction stays within your verified student community.",
  },
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8"
      >
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
              {data.collegeName ?? "CampusHub"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {data.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              One platform for every part of your college life
            </p>
          </div>
          {!data.isPremium && (
            <Link href="/premium">
              <Button className="bg-[oklch(var(--premium))] text-[oklch(var(--premium-foreground))] hover:opacity-90 whitespace-nowrap">
                <Crown className="h-4 w-4 mr-2" /> Go Premium
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
      >
        <StatCard label="Uploads" value={data.uploadsCount} icon={FileUp} />
        <StatCard label="Downloads" value={data.downloadsReceived} icon={Download} />
        <StatCard label="Coupons" value={data.couponsCount} icon={Ticket} />
        <StatCard label="Plan" value={data.isPremium ? "Premium" : "Free"} icon={Crown} />
      </motion.div>

      {/* Quick Access */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm sm:text-base">Quick Access</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
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
                  className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl border bg-card p-3 sm:p-4 hover:border-primary hover:-translate-y-0.5 transition-all"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{link.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Notices + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="ch-notebook-line rounded-xl border bg-card p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm sm:text-base">Recent Notices</h2>
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
            <h2 className="font-semibold text-sm sm:text-base">Upcoming Events</h2>
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
                animate={{ opacity: 1, y: 0 }}
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