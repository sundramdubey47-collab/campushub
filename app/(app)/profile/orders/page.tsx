import Link from "next/link"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/empty-state"

export default async function MyOrdersPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: {
      buyerOrders: {
        orderBy: { createdAt: "desc" },
        include: { listing: { select: { title: true, imageUrl: true } } },
      },
    },
  })

  const orders = dbUser?.buyerOrders ?? []

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Browse the marketplace to find what you need" />
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-card p-4 flex items-center gap-3">
              {order.listing.imageUrl && (
                <img src={order.listing.imageUrl} alt="" className="w-12 h-12 object-cover rounded-lg" />
              )}
              <span className="text-sm flex-1 truncate">{order.listing.title}</span>
              {order.finalPrice && <span className="font-bold text-sm shrink-0">₹{order.finalPrice}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}