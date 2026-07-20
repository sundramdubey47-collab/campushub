import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/stat-card"
import { LogoutButton } from "@/components/logout-button"
import { AvatarEdit } from "@/components/avatar-edit"
import { ChevronRight, FileUp, Download, Ticket, ShoppingBag, Bookmark, Crown, Package,Mail, GraduationCap, ShieldCheck, } from "lucide-react"

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
  {
    href: "/profile/orders",
    label: "My Orders",
    icon: ShoppingBag,
    count: dbUser._count.buyerOrders,
  },

  {
    href: "/rentals/my-bookings",
    label: "My Rentals",
    icon: Package,
  },

  {
    href: "/profile/uploads",
    label: "My Uploads",
    icon: FileUp,
    count: dbUser._count.uploadedNotes,
  },

  {
    href: "/profile/bookmarks",
    label: "Bookmarked Resources",
    icon: Bookmark,
    count: dbUser._count.bookmarks,
  },

  {
    href: "/profile/coupons",
    label: "My Coupons",
    icon: Ticket,
    count: dbUser._count.coupons,
  },
]

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
 
{/* Profile header card */}
<div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
  <AvatarEdit
    initialUrl={dbUser.avatarUrl}
    initials={initials}
  />

  <div className="min-w-0 flex-1">
    <h1 className="text-xl font-bold truncate">
      {dbUser.name}
    </h1>

    <p className="text-sm text-muted-foreground truncate">
      {dbUser.email}
    </p>

    <div className="flex flex-wrap gap-2 pt-3">

      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
        {dbUser.role}
      </span>

      {dbUser.isPremium && (
        <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-medium text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
          <Crown className="h-3 w-3" />
          Premium
        </span>
      )}

      {dbUser.college && (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px]">
          {dbUser.college.name}
        </span>
      )}

      {dbUser.course && (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px]">
          {dbUser.course.name}
        </span>
      )}

      {dbUser.semester && (
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px]">
          Semester {dbUser.semester.number}
        </span>
      )}

    </div>
  </div>
</div>
{!dbUser.isPremium && (
  <Link href="/premium">
    <div className="group overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 p-[1px] transition hover:scale-[1.01]">
      <div className="flex items-center justify-between rounded-2xl bg-background px-5 py-4">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-white">
            <Crown className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-semibold">
              Upgrade to Premium
            </h3>

            <p className="text-sm text-muted-foreground">
              Unlimited premium notes, exclusive tests and faster downloads.
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
)}
<div className="border-t" />
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

  <StatCard
    label="Uploads"
    value={dbUser._count.uploadedNotes}
    icon={FileUp}
  />

  <StatCard
    label="Downloads"
    value={totalDownloadsReceived._sum.downloads ?? 0}
    icon={Download}
  />

  <StatCard
    label="Coupons"
    value={dbUser._count.coupons}
    icon={Ticket}
  />

  <StatCard
    label="Orders"
    value={dbUser._count.buyerOrders}
    icon={ShoppingBag}
  />
</div>   
   <div className="space-y-4">

  <div>
    <h2 className="text-lg font-bold">
      Quick Actions
    </h2>

    <p className="text-sm text-muted-foreground">
      Manage everything from one place.
    </p>
  </div>

  <div className="grid gap-3">

    {menuItems.map((item) => {

      const Icon = item.icon

      return (

        <Link
          key={item.href}
          href={item.href}
          className="group rounded-2xl border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
        >

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary group-hover:text-white">

              <Icon className="h-5 w-5 text-primary group-hover:text-white" />

            </div>

            <div className="min-w-0 flex-1">

              <h3 className="font-semibold">

                {item.label}

              </h3>

              <p className="text-sm text-muted-foreground">

                {item.label === "My Uploads" &&
                  "Manage all your uploaded notes."}

                {item.label === "My Coupons" &&
                  "View and edit your coupons."}

                {item.label === "My Orders" &&
                  "Track your marketplace orders."}

                {item.label === "My Rentals" &&
                  "Manage rented and listed items."}

                {item.label === "Bookmarked Resources" &&
                  "Access your saved resources anytime."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {item.count !== undefined && (
                <div className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
                  {item.count}
                </div>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      )
    })}
   <div className="rounded-2xl border bg-card p-5">

  <h3 className="font-semibold">
    Account
  </h3>

  <p className="mt-1 text-sm text-muted-foreground">
    Manage your account settings and securely sign out.
  </p>

  <div className="mt-5">
    <LogoutButton />
  </div>

</div> 
  </div>
</div>   
    </div>
  )
}