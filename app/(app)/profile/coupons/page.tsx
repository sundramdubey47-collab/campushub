import Link from "next/link"
import { ArrowLeft, Tag } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/empty-state"

export default async function MyCouponsPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: {
      coupons: {
        orderBy: { createdAt: "desc" },
        select: { id: true, code: true, discountPercent: true, isUsed: true, createdAt: true },
      },
    },
  })

  const coupons = dbUser?.coupons ?? []

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <h1 className="text-2xl font-bold">My Coupons</h1>

      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons yet" description="Earn coupons when premium members download your resources, or by referring friends" />
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-xl border bg-card p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-sm">{coupon.code}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(coupon.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-medium">{coupon.discountPercent}% off</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                coupon.isUsed ? "bg-muted text-muted-foreground" : "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]"
              }`}>
                {coupon.isUsed ? "Used" : "Available"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}