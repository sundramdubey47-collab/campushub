"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, Pencil, Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/empty-state"

type Listing = {
  id: number
  title: string
  description: string | null
  price: number | null
  status: string
  imageUrl: string | null
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [error, setError] = useState("")

  async function load() {
    const res = await fetch("/api/profile/my-listings")
    const data = await res.json()
    setListings(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(l: Listing) {
    setEditingId(l.id)
    setEditTitle(l.title)
    setEditPrice(l.price?.toString() ?? "")
    setError("")
  }

  async function saveEdit(id: number) {
    setError("")
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, price: editPrice }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      return
    }
    setEditingId(null)
    load()
  }

  async function deleteListing(id: number) {
    if (!confirm("Delete this listing permanently?")) return
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" })
    if (res.ok) load()
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <h1 className="text-2xl font-bold">My Listings</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : listings.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No listings yet" description="Items you list on the Marketplace will show up here" />
      ) : (
        <div className="space-y-2">
          {listings.map((l) => (
            <div key={l.id} className="rounded-xl border bg-card p-4">
              {editingId === l.id ? (
                <div className="space-y-2">
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Price" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(l.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {l.imageUrl && <img src={l.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">₹{l.price ?? "—"} • {l.status}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(l)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteListing(l.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}