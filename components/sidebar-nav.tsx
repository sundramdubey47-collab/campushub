"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Bell, ShoppingBag, User, Calendar, Search, Package, ShieldCheck, Crown } from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/notices", label: "Notices", icon: Bell },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/rentals", label: "Rentals", icon: Package },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(role)
  const isSuperAdmin = role === "SUPER_ADMIN"

 let allLinks = links
if (isAdmin) allLinks = [...allLinks, { href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
if (isSuperAdmin) allLinks = [...allLinks, { href: "/super-admin", label: "Super Admin", icon: Crown }]
  return (
    <nav className="flex flex-col gap-1 p-4">
      {allLinks.map((link) => {
        const Icon = link.icon
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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