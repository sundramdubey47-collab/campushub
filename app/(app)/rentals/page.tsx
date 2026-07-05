"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
      setError("Dono dates zaroori hain")
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
      <Button className="w-full" onClick={() => setShowForm(true)}>
        Book Karo
      </Button>
    )
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div>
        <label className="text-xs text-muted-foreground">Start Date</label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Return Date</label>
        <Input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Coupon Code (optional)</label>
        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="CH-XXXXXXXX" />
      </div>
      <Button className="w-full" onClick={handleBook} disabled={loading}>
        {loading ? "Book ho raha hai..." : "Confirm Karo"}
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
    <div className="space-y-6">
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Rentals</h1>
  <div className="flex gap-2">
    <Link href="/rentals/my-bookings">
      <Button variant="outline">Meri Rentals</Button>
    </Link>
    <Link href="/rentals/create">
      <Button>Item Rent Pe Do</Button>
    </Link>
  </div>
</div>

      {loading ? (
        <p className="text-muted-foreground">Load ho raha hai...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Koi item nahi hai</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4 space-y-2">
                <h2 className="font-semibold">{item.title}</h2>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                <p className="font-bold">
                  ₹{item.price} / {item.pricingType.toLowerCase()}
                </p>
                {item.securityDeposit > 0 && (
                  <p className="text-xs text-muted-foreground">Deposit: ₹{item.securityDeposit}</p>
                )}
                <p className="text-xs text-muted-foreground">By {item.owner.name}</p>

                <BookingForm item={item} onDone={loadItems} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}