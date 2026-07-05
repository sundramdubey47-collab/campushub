"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type Booking = {
  id: number
  startDate: string
  expectedReturnDate: string
  actualReturnDate: string | null
  status: string
  rentAmount: number
  securityDeposit: number
  lateFee: number
  item: { title: string; imageUrl: string | null }
  renter?: { name: string }
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

  async function handleReturn(bookingId: number) {
    setMessage("")
    const res = await fetch(`/api/rental-bookings/${bookingId}/return`, { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }

    setMessage(data.lateFee > 0 ? `Returned successfully. Late fee: ₹${data.lateFee}` : "Returned on time- No late fee applied!")
    load()
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">My Rentals</h1>

      {message && <p className="text-sm font-medium border rounded-lg p-3">{message}</p>}

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">My Rentls</h2>
        {asRenter.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rentals yet-Start exploring items to rent</p>
        ) : (
          asRenter.map((b) => (
            <div key={b.id} className="border rounded-lg p-4 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{b.item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${b.status === "RETURNED" ? "bg-muted" : "bg-yellow-500/20 text-yellow-600"}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(b.startDate).toLocaleDateString()} → {new Date(b.expectedReturnDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Rent: ₹{b.rentAmount} • Deposit: ₹{b.securityDeposit}
                {b.lateFee > 0 && ` • Late Fee: ₹${b.lateFee}`}
              </p>
              {b.status !== "RETURNED" && (
                <Button size="sm" onClick={() => handleReturn(b.id)}>
                  Return Now
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg"> my Items rented by others</h2>
        {asOwner.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active rentals from your side</p>
        ) : (
          asOwner.map((b) => (
            <div key={b.id} className="border rounded-lg p-4 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{b.item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded ${b.status === "RETURNED" ? "bg-muted" : "bg-yellow-500/20 text-yellow-600"}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Renter: {b.renter?.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(b.startDate).toLocaleDateString()} → {new Date(b.expectedReturnDate).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}