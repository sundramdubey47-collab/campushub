"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Plus, History } from "lucide-react"

type Item = {
  id: number
  title: string
  description: string | null
  category: string
  pricingType: string
  price: number
  securityDeposit: number
  imageUrl: string | null
  owner: { name: string }
}

function BookingForm({ item, onDone }: { item: Item; onDone: () => void }) {
  const [startDate, setStartDate] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleBook() {
    setError("")
    if (!startDate || !expectedReturnDate) {
      setError("Please select both dates")
      return
    }
    setLoading(true)

    const res = await fetch(`/api/rentals/${item.id}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, expectedReturnDate, couponCode: couponCode || undefined }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    onDone()
  }

  if (!showForm) {
    return (
      <Button size="sm" className="w-full" onClick={() => setShowForm(true)}>
        Rent Now
      </Button>
    )
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div>
        <label className="text-[11px] text-muted-foreground">Start Date</label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label className="text-[11px] text-muted-foreground">Return By</label>
        <Input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
      </div>
      <div>
        <label className="text-[11px] text-muted-foreground">Coupon Code (optional)</label>
        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="CH-XXXXXXXX" />
      </div>
      <Button size="sm" className="w-full" onClick={handleBook} disabled={loading}>
        {loading ? "Booking..." : "Confirm Booking"}
      </Button>
    </div>
  )
}

export default function RentalsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  async function loadItems() {
    setLoading(true)
    const res = await fetch("/api/rentals")
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rentals"
        description="Borrow what you need — books, gear, and more, without buying"
        action={
          <div className="flex gap-2">
            <Link href="/rentals/my-bookings">
              <Button variant="outline" size="sm"><History className="h-4 w-4 mr-1.5" /> My Rentals</Button>
            </Link>
            <Link href="/rentals/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> List an Item</Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No items available for rent"
          description="Have something others could use? List it and start earning"
          action={
            <Link href="/rentals/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> List an Item</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-xl border bg-card overflow-hidden shadow-sm"
            >
              {item.imageUrl && (
  <div className="aspect-video bg-muted overflow-hidden flex items-center justify-center">
    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
  </div>
)}
              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-sm">{item.title}</h2>
                {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                <p className="font-bold text-sm">
                  ₹{item.price} <span className="font-normal text-muted-foreground">/ {item.pricingType.toLowerCase()}</span>
                </p>
                {item.securityDeposit > 0 && (
                  <p className="text-[11px] text-muted-foreground">Refundable deposit: ₹{item.securityDeposit}</p>
                )}
                <p className="text-[11px] text-muted-foreground">Owned by {item.owner.name}</p>

                <BookingForm item={item} onDone={loadItems} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}