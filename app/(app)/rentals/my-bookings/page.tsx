"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type Booking = {
  id: number
  startDate: string
  expectedReturnDate: string
  actualStartDate: string | null
  actualReturnDate: string | null
  status: string
  rentAmount: number
  securityDeposit: number
  lateFee: number
  item: { title: string; imageUrl: string | null }
  renter?: { name: string }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Waiting for owner's approval",
  APPROVED: "Approved — waiting for pickup",
  REJECTED: "Request declined",
  ACTIVE: "Currently rented",
  RETURNED: "Returned",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-600",
  APPROVED: "bg-blue-500/15 text-blue-600",
  REJECTED: "bg-red-500/15 text-red-600",
  ACTIVE: "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]",
  RETURNED: "bg-muted text-muted-foreground",
}

function daysSince(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function MyRentalBookingsPage() {
  const [asRenter, setAsRenter] = useState<Booking[]>([])
  const [asOwner, setAsOwner] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    setLoading(true)
    const res = await fetch("/api/my-rental-bookings")
    const data = await res.json()
    setAsRenter(data.asRenter)
    setAsOwner(data.asOwner)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function respond(bookingId: number, action: "approve" | "reject") {
    await fetch(`/api/rental-bookings/${bookingId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    load()
  }

  async function confirmReceived(bookingId: number) {
    await fetch(`/api/rental-bookings/${bookingId}/confirm-received`, { method: "POST" })
    load()
  }

  async function confirmReturn(bookingId: number) {
    setMessage("")
    const res = await fetch(`/api/rental-bookings/${bookingId}/return`, { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }

    setMessage(data.lateFee > 0 ? `Item returned. Late fee: ₹${data.lateFee}` : "Item returned, no late fee!")
    load()
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">My Rentals</h1>

      {message && <p className="text-sm font-medium border rounded-lg p-3">{message}</p>}

      {/* As Renter (B) */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Items I'm Renting</h2>
        {asRenter.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rentals yet</p>
        ) : (
          asRenter.map((b) => (
            <div key={b.id} className="border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{b.item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Requested: {new Date(b.startDate).toLocaleDateString()} → {new Date(b.expectedReturnDate).toLocaleDateString()}
              </p>

              {b.status === "ACTIVE" && b.actualStartDate && (
                <p className="text-sm text-primary font-medium">
                  You've had this since {new Date(b.actualStartDate).toLocaleDateString()} — {daysSince(b.actualStartDate)} day(s) so far
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                Rent: ₹{b.rentAmount} • Deposit: ₹{b.securityDeposit}
                {b.lateFee > 0 && ` • Late Fee: ₹${b.lateFee}`}
              </p>

              {b.status === "APPROVED" && (
                <Button size="sm" onClick={() => confirmReceived(b.id)}>
                  I've Received the Item
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* As Owner (A) */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Items I've Listed</h2>
        {asOwner.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rental requests yet</p>
        ) : (
          asOwner.map((b) => (
            <div key={b.id} className="border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{b.item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">Requested by {b.renter?.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(b.startDate).toLocaleDateString()} → {new Date(b.expectedReturnDate).toLocaleDateString()}
              </p>

              {b.status === "ACTIVE" && b.actualStartDate && (
                <p className="text-sm text-primary font-medium">
                  Rented out since {new Date(b.actualStartDate).toLocaleDateString()} — {daysSince(b.actualStartDate)} day(s) so far
                </p>
              )}

              {b.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(b.id, "approve")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => respond(b.id, "reject")}>Reject</Button>
                </div>
              )}

              {b.status === "ACTIVE" && (
                <Button size="sm" onClick={() => confirmReturn(b.id)}>
                  I've Received the Item Back
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}