"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FileText, Bell, ShoppingBag, User, Calendar, Search,
  Package, ShieldCheck, Crown, MessageCircle, Brain, Clock, CalendarCheck, MessageSquare
} from "lucide-react"

const baseLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Resources", icon: FileText },
  { href: "/notices", label: "Notices", icon: Bell },
  { href: "/chat", label: "Campus Chat", icon: MessageCircle },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/rentals", label: "Rentals", icon: Package },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/timetable", label: "Timetable", icon: Clock },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/tests", label: "Tests Arena", icon: Brain },
  { href: "/ai-assistant", label: "24x7 Help Center", icon: MessageCircle },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/profile", label: "Profile", icon: User },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role)
  const isSuperAdmin = role === "SUPER_ADMIN"
  const isFaculty = role === "FACULTY"

  let allLinks = [...baseLinks]
  if (isAdmin || isFaculty) allLinks.push({ href: "/admin/timetable", label: "Manage Timetable", icon: Clock })
  if (isAdmin) allLinks.push({ href: "/admin", label: "Admin Panel", icon: ShieldCheck })
  if (isSuperAdmin) allLinks.push({ href: "/super-admin", label: "Super Admin", icon: Crown })
if (isAdmin) allLinks.push({ href: "/admin/feedback", label: "Feedback Inbox", icon: MessageSquare })

  return (
    <nav className="flex flex-col gap-0.5 p-3 pb-6">
      {allLinks.map((link) => {
        const Icon = link.icon
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors shrink-0",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}