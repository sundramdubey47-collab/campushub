import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { LogoutButton } from "@/components/logout-button"
import { AvatarEdit } from "@/components/avatar-edit"
import { ChevronRight, FileUp, Download, Ticket, ShoppingBag, Bookmark, Crown, Package } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    include: {
      college: { select: { name: true } },
      department: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
      _count: {
        select: {
          uploadedNotes: true,
          coupons: true,
          buyerOrders: true,
          bookmarks: true,
        },
      },
    },
  })

  if (!dbUser) {
    return <p className="text-red-500 text-sm">Could not load profile</p>
  }

  const totalDownloadsReceived = await prisma.note.aggregate({
    where: { uploadedById: dbUser.id },
    _sum: { downloads: true },
  })

  const initials = dbUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

  const menuItems = [
    { href: "/profile/uploads", label: "My Uploads", icon: FileUp, count: dbUser._count.uploadedNotes },
    { href: "/profile/coupons", label: "My Coupons", icon: Ticket, count: dbUser._count.coupons },
    { href: "/profile/orders", label: "My Orders", icon: ShoppingBag, count: dbUser._count.buyerOrders },
    { href: "/rentals/my-bookings", label: "My Rentals", icon: Package },
    { href: "/profile/bookmarks", label: "Bookmarked Resources", icon: Bookmark, count: dbUser._count.bookmarks },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile header card */}
      <div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
        <AvatarEdit initialUrl={dbUser.avatarUrl} initials={initials} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold truncate">{dbUser.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{dbUser.email}</p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full">{dbUser.role}</span>
            {dbUser.isPremium && (
              <span className="text-[10px] font-medium bg-[oklch(var(--premium)/0.18)] text-[oklch(var(--premium))] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="h-2.5 w-2.5" /> Premium
              </span>
            )}
            {dbUser.college && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{dbUser.college.name}</span>}
            {dbUser.course && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{dbUser.course.name}</span>}
            {dbUser.semester && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">Sem {dbUser.semester.number}</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <LogoutButton />
      </div>

      {!dbUser.isPremium && (
        <div className="rounded-xl border border-[oklch(var(--premium)/0.4)] bg-gradient-to-r from-[oklch(var(--premium)/0.1)] to-transparent p-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm flex items-center gap-2">
            <Crown className="h-4 w-4 text-[oklch(var(--premium))]" />
            Unlock premium notes, tests & more
          </p>
          <Link href="/premium" className="text-xs font-medium text-[oklch(var(--premium))] underline underline-offset-2">
            View Plans →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Uploads" value={dbUser._count.uploadedNotes} icon={FileUp} />
        <StatCard label="Downloads Received" value={totalDownloadsReceived._sum.downloads ?? 0} icon={Download} />
        <StatCard label="Coupons" value={dbUser._count.coupons} icon={Ticket} />
        <StatCard label="Orders" value={dbUser._count.buyerOrders} icon={ShoppingBag} />
      </div>

      <div className="rounded-2xl border bg-card divide-y">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-xs text-muted-foreground">{item.count}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}