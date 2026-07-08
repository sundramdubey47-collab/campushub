"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone } from "lucide-react"

type Item = {
  id: number
  title: string
  description: string | null
  category: string
  pricingType: string
  price: number
  securityDeposit: number
  imageUrl: string | null
  owner: { name: string; phone: string | null }
}

export default function RentalDetailPage() {
  const params = useParams()
  const itemId = params.id

  const [item, setItem] = useState<Item | null>(null)
  const [startDate, setStartDate] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    fetch(`/api/rentals/${itemId}`).then((r) => r.json()).then(setItem)
  }, [itemId])

  async function handleRequest() {
    setError("")
    if (!startDate || !expectedReturnDate) {
      setError("Please select both dates")
      return
    }
    setLoading(true)

    const res = await fetch(`/api/rentals/${itemId}/book`, {
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

    setRequested(true)
  }

  if (!item) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="max-w-lg space-y-4">
      {item.imageUrl && (
        <div className="aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">{item.title}</h1>
        {item.description && <p className="text-muted-foreground text-sm mt-1">{item.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-muted px-2 py-1 rounded-full">{item.category}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded-full">₹{item.price} / {item.pricingType.toLowerCase()}</span>
        {item.securityDeposit > 0 && (
          <span className="text-xs bg-muted px-2 py-1 rounded-full">Deposit: ₹{item.securityDeposit}</span>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-1">
        <p className="text-sm font-medium">Owner: {item.owner.name}</p>
        {item.owner.phone && (
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> {item.owner.phone}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {requested ? (
        <div className="rounded-xl border bg-[oklch(var(--success)/0.1)] p-4">
          <p className="text-sm text-[oklch(var(--success))] font-medium">Request sent! ✅</p>
          <p className="text-xs text-muted-foreground mt-1">
            The owner will review your request. Check "My Rentals" for updates.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">Request to Rent</h2>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Return By</Label>
            <Input type="date" value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Coupon Code (optional)</Label>
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="CH-XXXXXXXX" />
          </div>
          <Button className="w-full" onClick={handleRequest} disabled={loading}>
            {loading ? "Sending request..." : "Request to Rent"}
          </Button>
        </div>
      )}
    </div>
  )
}