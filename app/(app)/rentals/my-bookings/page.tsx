"use client"

import { useEffect, useState } from "react"
import { Package, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Booking = {
  id: number
  startDate: string
  expectedReturnDate: string
  actualStartDate: string | null
  status: string
  rentAmount: number
  securityDeposit: number
  lateFee: number
  otp: string | null
  item: { title: string; imageUrl: string | null; pricingType: string }
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
  const [otpInputs, setOtpInputs] = useState<{ [key: number]: string }>({})
  const [activeTab, setActiveTab] = useState<"renter" | "owner">("renter")

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

  async function verifyOtp(bookingId: number) {
    setMessage("")
    const res = await fetch(`/api/rental-bookings/${bookingId}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: otpInputs[bookingId] }),
    })
    const data = await res.json()

    if (!res.ok) {
      setMessage("❌ " + data.error)
      return
    }

    setMessage("✅ Handover confirmed! Item is now marked as rented out.")
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

  const pendingCount = asOwner.filter((b) => b.status === "PENDING").length

  return (
    <div className="max-w-2xl space-y-8">
     <div className="space-y-4">
  <div>
    <h1 className="text-2xl font-bold">My Rentals</h1>
    <p className="text-sm text-muted-foreground">
      Manage your rented items and your listed rental items.
    </p>
  </div>

  {message && (
    <div
  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
    message.startsWith("✅")
      ? "border-green-500/30 bg-green-500/10 text-green-700"
      : "border-red-500/30 bg-red-500/10 text-red-700"
  }`}
>
      {message}
    </div>
  )}

  <div className="grid grid-cols-2 rounded-xl border bg-card p-1">
    <button
      onClick={() => setActiveTab("renter")}
      className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
        activeTab === "renter"
          ? "bg-primary text-primary-foreground shadow"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <ShoppingBag className="h-4 w-4" />
      Renting
    </button>

    <button
      onClick={() => setActiveTab("owner")}
      className={`relative flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
        activeTab === "owner"
          ? "bg-primary text-primary-foreground shadow"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Package className="h-4 w-4" />
      Listed

      {pendingCount > 0 && (
        <span className="absolute right-3 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {pendingCount}
        </span>
      )}
    </button>
  </div>
</div>

      {/* As Renter (B) */}
      {activeTab === "renter" && (
      <div className="space-y-3">
<div>
  <h2 className="text-xl font-bold">
    📥 Items I'm Renting
  </h2>

  <p className="text-sm text-muted-foreground">
    Track your rented items and their current status.
  </p>
</div>
        {asRenter.length === 0 ? (
         <div className="rounded-xl border border-dashed p-8 text-center">
  <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
  <h3 className="font-semibold">No Rentals Yet</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Items you rent from other students will appear here.
  </p>
</div>
        ) : (
          asRenter.map((b) => (
            <div key={b.id}className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm transition hover:shadow-md" >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{b.item.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[b.status]}`}>
                  {STATUS_LABELS[b.status]}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Requested: {new Date(b.startDate).toLocaleDateString()} → {new Date(b.expectedReturnDate).toLocaleDateString()}
              </p>

              {b.status === "APPROVED" && b.otp && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs text-muted-foreground">Give this code to the owner when you receive the item:</p>
                  <p className="text-2xl font-bold tracking-widest text-primary mt-1">{b.otp}</p>
                </div>
              )}

              {b.status === "ACTIVE" && b.actualStartDate && (
                <div className="rounded-lg bg-muted/40 p-3 space-y-0.5">
                  <p className="text-sm font-medium">
                    You rented this from {b.item.title.split(" ")[0] || "owner"} — {new Date(b.actualStartDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-primary font-medium">{daysSince(b.actualStartDate)} day(s) so far</p>
                  <p className="text-xs text-muted-foreground">₹{b.rentAmount} / {b.item.pricingType.toLowerCase()}</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Rent: ₹{b.rentAmount} • Deposit: ₹{b.securityDeposit}
                {b.lateFee > 0 && ` • Late Fee: ₹${b.lateFee}`}
              </p>
            </div>
          ))
        )}
      </div>
      )}
      {/* As Owner (A) */}
      {activeTab === "owner" && (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
<div>
  <h2 className="text-xl font-bold">
    📤 Items I've Listed
  </h2>

  <p className="text-sm text-muted-foreground">
    Manage rental requests for your listed items.
  </p>
</div>
          {pendingCount > 0 && (
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </div>
        {asOwner.length === 0 ? (
         <div className="rounded-xl border border-dashed p-8 text-center">
  <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
  <h3 className="font-semibold">No Requests Yet</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Rental requests for your listed items will appear here.
  </p>
</div>
        ) : (
          asOwner.map((b) => (
            <div key={b.id} className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm transition hover:shadow-md">
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
                  <Button size="sm" className="rounded-lg" onClick={() => respond(b.id, "approve")}>Approve</Button>
                  <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => respond(b.id, "reject")}>Reject</Button>
                </div>
              )}

              {b.status === "APPROVED" && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter OTP from renter"
                    value={otpInputs[b.id] || ""}
                    onChange={(e) => setOtpInputs({ ...otpInputs, [b.id]: e.target.value })}
                    className="max-w-[200px]"
                  />
                  <Button size="sm" onClick={() => verifyOtp(b.id)}>Confirm Handover</Button>
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
      )}
    </div>
    
  )
}