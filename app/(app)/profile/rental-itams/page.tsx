"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"

type RentalItem = {
  id: number
  title: string
  price: number
  pricingType: string
  status: string
  imageUrl: string | null
  openBookings: number
}

export default function MyRentalItemsPage() {
  const [items, setItems] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    const res = await fetch("/api/profile/my-rental-items", { cache: "no-store" })
    setItems(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function remove(item: RentalItem) {
    if (!confirm(`"${item.title}" You need to delete this item.?`)) return
    setError("")

    const res = await fetch(`/api/rentals/${item.id}`, { method: "DELETE" })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data.error || "Could not delete")
      return
    }
    load()
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <h1 className="text-2xl font-bold">My Rental Items</h1>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <EmptyState icon={Package} title="No rental items yet" description="Items you put up for rent will show up here" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              {item.imageUrl && <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-muted object-contain" />}

              <Link href={`/rentals/${item.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{item.price} / {item.pricingType.toLowerCase()} • {item.status === "AVAILABLE" ? "Available" : "Rented out"}
                </p>
                {item.openBookings > 0 && (
                  <p className="mt-0.5 text-[11px] font-medium text-primary">{item.openBookings} active/pending request(s)</p>
                )}
              </Link>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-red-500"
                onClick={() => remove(item)}
                disabled={item.openBookings > 0}
                title={item.openBookings > 0 ? "Please complete or resolve all pending requests and rentals first." : "Delete"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}