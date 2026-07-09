import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/empty-state"
import { StatCard } from "@/components/stat-card"
import { LogoutButton } from "@/components/logout-button"
import { FileUp, Download, Ticket, ShoppingBag, Bookmark, Crown, Tag } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    include: {
      college: { select: { name: true } },
      department: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
      uploadedNotes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, views: true, downloads: true, createdAt: true },
      },
      coupons: { orderBy: { createdAt: "desc" } },
      buyerOrders: {
        orderBy: { createdAt: "desc" },
        include: { listing: { select: { title: true, imageUrl: true } } },
      },
      bookmarks: {
        orderBy: { createdAt: "desc" },
        include: { note: { select: { id: true, title: true } } },
      },
    },
  })

  if (!dbUser) {
    return <p className="text-red-500 text-sm">Could not load profile</p>
  }

  const totalDownloadsReceived = dbUser.uploadedNotes.reduce((sum, n) => sum + n.downloads, 0)
  const initials = dbUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-2xl border bg-card p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shrink-0">
          {initials}
        </div>
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
        <StatCard label="Uploads" value={dbUser.uploadedNotes.length} icon={FileUp} />
        <StatCard label="Downloads Received" value={totalDownloadsReceived} icon={Download} />
        <StatCard label="Coupons Earned" value={dbUser.coupons.length} icon={Ticket} />
        <StatCard label="Orders" value={dbUser.buyerOrders.length} icon={ShoppingBag} />
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><FileUp className="h-4 w-4" /> My Uploads</h2>
        {dbUser.uploadedNotes.length === 0 ? (
          <EmptyState icon={FileUp} title="No uploads yet" description="Share your notes and help fellow students" />
        ) : (
          <div className="space-y-2">
            {dbUser.uploadedNotes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div className="rounded-xl border bg-card p-3 hover:border-primary transition-colors flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground shrink-0 ml-2">{note.views} views • {note.downloads} downloads</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Tag className="h-4 w-4" /> My Coupons</h2>
        {dbUser.coupons.length === 0 ? (
          <EmptyState icon={Tag} title="No coupons yet" description="Earn coupons when premium members download your resources" />
        ) : (
          <div className="space-y-2">
            {dbUser.coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-xl border bg-card p-3 flex items-center justify-between">
                <span className="font-mono text-sm">{coupon.code}</span>
                <span className="text-sm">{coupon.discountPercent}% off</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  coupon.isUsed ? "bg-muted text-muted-foreground" : "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]"
                }`}>
                  {coupon.isUsed ? "Used" : "Available"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> My Orders</h2>
        {dbUser.buyerOrders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders yet" description="Browse the marketplace to find what you need" />
        ) : (
          <div className="space-y-2">
            {dbUser.buyerOrders.map((order) => (
              <div key={order.id} className="rounded-xl border bg-card p-3 flex items-center gap-3">
                {order.listing.imageUrl && (
                  <img src={order.listing.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg" />
                )}
                <span className="text-sm flex-1 truncate">{order.listing.title}</span>
                {order.finalPrice && <span className="font-bold text-sm shrink-0">₹{order.finalPrice}</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Bookmark className="h-4 w-4" /> Bookmarked Resources</h2>
        {dbUser.bookmarks.length === 0 ? (
          <EmptyState icon={Bookmark} title="No bookmarks yet" description="Save resources to find them quickly later" />
        ) : (
          <div className="space-y-2">
            {dbUser.bookmarks.map((b) => (
              <Link key={b.id} href={`/notes/${b.note.id}`}>
                <div className="rounded-xl border bg-card p-3 hover:border-primary transition-colors text-sm">
                  {b.note.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}