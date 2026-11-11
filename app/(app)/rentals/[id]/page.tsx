"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FullImage } from "@/components/full-image"
import { Phone, Trash2 } from "lucide-react"

type Item = {
  id: number
  title: string
  description: string | null
  category: string
  pricingType: string
  price: number
  securityDeposit: number
  imageUrl: string | null
  status: string
  isOwner: boolean
  owner: { id: number; name: string; phone: string | null }
}

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [loadError, setLoadError] = useState("")
  const [startDate, setStartDate] = useState("")
  const [expectedReturnDate, setExpectedReturnDate] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetch(`/api/rentals/${itemId}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setLoadError(data.error || "Could not load this item")
          return
        }
        setItem(data)
      })
      .catch(() => setLoadError("Could not load this item"))
  }, [itemId])

  async function handleRequest() {
    setError("")

    if (!startDate || !expectedReturnDate) {
      setError("Please select both dates")
      return
    }
    if (startDate < today) {
      setError("Start date cannot be in the past")
      return
    }
    if (expectedReturnDate < startDate) {
      setError("Return date must be after the start date")
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

  async function handleDelete() {
    if (!confirm("Is item ko delete karna hai? Ye wapas nahi aayega.")) return
    setError("")
    setDeleting(true)

    const res = await fetch(`/api/rentals/${itemId}`, { method: "DELETE" })
    const data = await res.json().catch(() => ({}))
    setDeleting(false)

    if (!res.ok) {
      setError(data.error || "Could not delete")
      return
    }
    router.push("/rentals")
    router.refresh()
  }

  if (loadError) return <p className="text-sm text-red-500">{loadError}</p>
  if (!item) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {item.imageUrl && (
        <FullImage src={item.imageUrl} alt={item.title} ratio="aspect-[4/3]" zoom className="rounded-xl border" />
      )}

      <div>
        <h1 className="text-2xl font-bold">{item.title}</h1>
        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-muted px-2 py-1 text-xs">{item.category}</span>
        <span className="rounded-full bg-muted px-2 py-1 text-xs">
          ₹{item.price} / {item.pricingType.toLowerCase()}
        </span>
        {item.securityDeposit > 0 && (
          <span className="rounded-full bg-muted px-2 py-1 text-xs">Deposit: ₹{item.securityDeposit}</span>
        )}
        {item.status !== "AVAILABLE" && (
          <span className="rounded-full bg-yellow-500/15 px-2 py-1 text-xs text-yellow-600">Currently rented out</span>
        )}
      </div>

      <div className="space-y-1 rounded-xl border bg-card p-4">
        <p className="text-sm font-medium">Owner: {item.owner.name}</p>
        {item.owner.phone && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {item.owner.phone}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {item.isOwner ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">Ye aapka apna listing hai</p>
          <p className="text-xs text-muted-foreground">
            Requests "My Rentals" me dikhengi. Item hatana ho to neeche delete karo.
          </p>
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-500"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete this item"}
          </Button>
        </div>
      ) : requested ? (
        <div className="rounded-xl border bg-[oklch(var(--success)/0.1)] p-4">
          <p className="text-sm font-medium text-[oklch(var(--success))]">Request sent ✅</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The owner will review your request. Check "My Rentals" for updates.
          </p>
        </div>
      ) : item.status === "AVAILABLE" ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Request to Rent</h2>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Return By</Label>
            <Input type="date" min={startDate || today} value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Coupon Code (optional)</Label>
            <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="CH-XXXXXXXX" />
          </div>
          <Button className="w-full" onClick={handleRequest} disabled={loading}>
            {loading ? "Sending request..." : "Request to Rent"}
          </Button>
        </div>
      ) : (
        <Button disabled variant="outline" className="w-full">
          Not available right now
        </Button>
      )}
    </div>
  )
}