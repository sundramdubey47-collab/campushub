import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { timeAgo, daysUntil } from "@/lib/time-ago"
import {
  Bell, Calendar, FileText, ShoppingBag, Package, Search,
  MessageCircle, Brain, ArrowRight, Crown, Megaphone, BookOpen,
  Code2, Trophy, Zap, ChevronRight,
} from "lucide-react"
import { DashboardCarousel } from "@/components/dashboard-carousel"
import Image from "next/image"
import { NowInClass } from "@/components/now-in-class"
import { TimetableLiveCard } from "@/components/timetable-live-card"

const quickLinks = [
  { href: "/notes", label: "Resources", icon: FileText },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/rentals", label: "Rentals", icon: Package },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/tests", label: "Tests Arena", icon: Brain, color: "oklch(0.55 0.15 278)"},
  { href: "/ai-assistant", label: "AI Assistant", icon: MessageCircle },
]

const NOTICE_ICONS = [Megaphone, BookOpen, Code2]
const NOTICE_COLORS = [
  { bg: "oklch(0.55 0.15 278 / 0.12)", fg: "oklch(0.55 0.15 278)" },
  { bg: "oklch(0.55 0.13 145 / 0.12)", fg: "oklch(0.55 0.13 145)" },
  { bg: "oklch(0.72 0.15 60 / 0.12)", fg: "oklch(0.72 0.15 60)" },
]

export default async function DashboardPage() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
  where: { email: session?.user?.email ?? "" },
  select: {
    id: true,
    name: true,
    avatarUrl: true,
    isPremium: true,
    collegeId: true,

    college: {
      select: {
        name: true,
      },
    },

    course: {
      select: {
        name: true,
      },
    },

    semester: {
      select: {
        number: true,
      },
    },
  },
})

  if (!dbUser) {
    return <p className="text-red-500 text-sm">Could not load dashboard</p>
  }

  const [recentNotices, upcomingEvents] = await Promise.all([
    prisma.notice.findMany({
      where: { collegeId: dbUser.collegeId ?? 0, isArchived: false },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: { id: true, title: true, content: true, createdAt: true, isPinned: true },
    }),
    prisma.event.findMany({
      where: { collegeId: dbUser.collegeId ?? 0, eventDate: { gte: new Date() } },
      orderBy: { eventDate: "asc" },
      take: 1,
      select: { id: true, title: true, eventDate: true, venue: true },
    }),
  ])

  const initials = dbUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
  const nextEvent = upcomingEvents[0]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-1.5">
            Hi {dbUser.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">Here's what's happening on campus today.</p>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
         <div className="h-11 w-11 rounded-full overflow-hidden bg-primary flex items-center justify-center border border-border">
  {dbUser.avatarUrl ? (
    <Image
      src={dbUser.avatarUrl}
      alt={dbUser.name}
      width={44}
      height={44}
      className="h-full w-full object-cover"
      unoptimized
    />
  ) : (
    <span className="text-sm font-bold text-primary-foreground">
      {initials}
    </span>
  )}
</div>
          {dbUser.course && (
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              {dbUser.course.name}{dbUser.semester ? ` Sem ${dbUser.semester.number}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Hero Banner */}
    <TimetableLiveCard />
  <DashboardCarousel collegeName={dbUser.college?.name ?? "your college"} />


      {/* What's Happening */}
      <div className="rounded-2xl border bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 px-1 pb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">What's Happening</h2>
        </div>

        {recentNotices.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1 py-4 text-center">No announcements yet</p>
        ) : (
          recentNotices.map((notice, i) => {
            const Icon = NOTICE_ICONS[i % NOTICE_ICONS.length]
            const color = NOTICE_COLORS[i % NOTICE_COLORS.length]
            return (
              <Link
                key={notice.id}
                href="/notices"
                className="flex items-start gap-3 py-3 border-t first:border-t-0 hover:bg-muted/50 -mx-1 px-1 rounded-lg transition-colors"
              >
                <div className="rounded-xl p-2.5 shrink-0" style={{ backgroundColor: color.bg }}>
                  <Icon className="h-4 w-4" style={{ color: color.fg }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{notice.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notice.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(notice.createdAt)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </Link>
            )
          })
        )}

        <Link href="/notices" className="block text-center text-xs font-medium text-primary pt-2 pb-1">
          View All Announcements
        </Link>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Upcoming Events</h2>
          </div>
          <Link href="/events" className="text-xs font-medium text-primary">View All</Link>
        </div>

        {!nextEvent ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
        ) : (
          <Link href="/events" className="flex items-center gap-3 hover:bg-muted/50 p-1 -m-1 rounded-lg transition-colors">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{nextEvent.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" /> {new Date(nextEvent.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {nextEvent.venue && <> · {nextEvent.venue}</>}
              </p>
            </div>
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full shrink-0">
              {daysUntil(nextEvent.eventDate)}
            </span>
          </Link>
        )}
      </div>

      {/* Quick Access */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Quick Access</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 hover:border-primary transition-colors"
              >
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {!dbUser.isPremium && (
        <div className="rounded-2xl border border-[oklch(var(--premium)/0.4)] bg-gradient-to-r from-[oklch(var(--premium)/0.1)] to-transparent p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[oklch(var(--premium)/0.2)] p-2 shrink-0">
              <Crown className="h-4 w-4 text-[oklch(var(--premium))]" />
            </div>
            <p className="text-xs font-medium">Unlock Premium features from ₹19/week</p>
          </div>
          <Link href="/premium">
            <Button size="sm" className="bg-[oklch(var(--premium))] text-[oklch(var(--premium-foreground))] hover:opacity-90 shrink-0">
              View
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}