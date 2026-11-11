import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { LogoutButton } from "@/components/logout-button"
import { AvatarEdit } from "@/components/avatar-edit"
import { PhoneEdit } from "@/components/phone-edit"
import { ProfileQrTrigger } from "@/components/profile-qr-trigger"
import {
  ChevronRight, FileUp, Download, Ticket, ShoppingBag, Bookmark, Crown, Package,
  Store, Gift, GraduationCap, BellRing,
} from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    include: {
      college: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
      _count: {
        select: {
          uploadedNotes: true,
          coupons: true,
          sellerListings: true,
          rentalItems: true,
          bookmarks: true,
        },
      },
    },
  })

  if (!dbUser) {
    return <p className="text-sm text-red-500">Could not load profile</p>
  }

  const downloads = await prisma.note.aggregate({
    where: { uploadedById: dbUser.id },
    _sum: { downloads: true },
  })

  const initials = dbUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
  const paymentsOn = process.env.PAYMENTS_ENABLED === "true"

  const menuItems = [
    { href: "/profile/uploads", label: "My Uploads", icon: FileUp, count: dbUser._count.uploadedNotes },
    { href: "/profile/listings", label: "My Listings", icon: ShoppingBag, count: dbUser._count.sellerListings },
    { href: "/profile/rental-items", label: "My Rental Items", icon: Store, count: dbUser._count.rentalItems },
    { href: "/rentals/my-bookings", label: "My Rentals", icon: Package },
    { href: "/profile/coupons", label: "My Coupons", icon: Ticket, count: dbUser._count.coupons },
    { href: "/profile/bookmarks", label: "Bookmarked Resources", icon: Bookmark, count: dbUser._count.bookmarks },
    { href: "/referrals", label: "Invite Friends", icon: Gift },
    { href: "/profile/academic", label: "Semester & Section", icon: GraduationCap },
    { href: "/profile/notifications", label: "Notification Settings", icon: BellRing },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <AvatarEdit initialUrl={dbUser.avatarUrl} initials={initials} />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{dbUser.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{dbUser.email}</p>
          <div className="pt-1">
            <PhoneEdit initialPhone={dbUser.phone} />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{dbUser.role}</span>
            {dbUser.isPremium && (
              <span className="flex items-center gap-1 rounded-full bg-[oklch(var(--premium)/0.18)] px-2 py-0.5 text-[10px] font-medium text-[oklch(var(--premium))]">
                <Crown className="h-2.5 w-2.5" /> Premium
              </span>
            )}
            {dbUser.college && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{dbUser.college.name}</span>}
            {dbUser.course && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{dbUser.course.name}</span>}
            {dbUser.semester && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Sem {dbUser.semester.number}</span>}
            {dbUser.section && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Section {dbUser.section}</span>}
            {!dbUser.emailVerified && (
              <Link href="/verify-email" className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-500">
                Verify Email
              </Link>
            )}
          </div>
        </div>

        <ProfileQrTrigger />
      </div>

      <div className="flex justify-end">
        <LogoutButton />
      </div>

      {paymentsOn && !dbUser.isPremium && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[oklch(var(--premium)/0.4)] bg-gradient-to-r from-[oklch(var(--premium)/0.1)] to-transparent p-4">
          <p className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4 text-[oklch(var(--premium))]" />
            Unlock premium notes, tests & more
          </p>
          <Link href="/premium" className="text-xs font-medium text-[oklch(var(--premium))] underline underline-offset-2">
            View Plans →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Uploads" value={dbUser._count.uploadedNotes} icon={FileUp} />
        <StatCard label="Downloads Received" value={downloads._sum.downloads ?? 0} icon={Download} />
        <StatCard label="Coupons" value={dbUser._count.coupons} icon={Ticket} />
        <StatCard label="Listings" value={dbUser._count.sellerListings} icon={ShoppingBag} />
      </div>

      <div className="divide-y rounded-2xl border bg-card">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/50"
            >
              <div className="shrink-0 rounded-lg bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.count !== undefined && <span className="text-xs text-muted-foreground">{item.count}</span>}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}