"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, HeartOff } from "lucide-react"
import { useSession } from "next-auth/react"

type Listing = {
  id: number
  title: string
  description: string | null
  category: string
  type: string
  price: number | null
  imageUrl: string | null
  location: string | null
  status: string
  seller: { id: number; name: string }
}

type Message = {
  id: number
  content: string
  createdAt: string
  sender: { id: number; name: string }
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const listingId = params.id

  const [listing, setListing] = useState<Listing | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/listings/${listingId}`).then((r) => r.json()).then(setListing)
    fetch(`/api/listings/${listingId}/wishlist`).then((r) => r.json()).then((d) => setWishlisted(d.wishlisted))
    loadMessages()
  }, [listingId])

  async function loadMessages() {
    const res = await fetch(`/api/listings/${listingId}/chat`)
    const data = await res.json()
    setMessages(data)
  }

  async function handleWishlistToggle() {
    const res = await fetch(`/api/listings/${listingId}/wishlist`, { method: "POST" })
    const data = await res.json()
    setWishlisted(data.wishlisted)
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    const res = await fetch(`/api/listings/${listingId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    })
    const message = await res.json()
    setMessages([...messages, message])
    setNewMessage("")
  }

  async function handleBuy() {
    setError("")
    const res = await fetch(`/api/listings/${listingId}/order`, { method: "POST" })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/marketplace")
  }

  if (!listing) return <p className="text-muted-foreground">Load ho raha hai...</p>

  const isOwner = (session?.user as any)?.id === listing.seller.id.toString()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
            {wishlisted ? <Heart className="h-4 w-4 fill-red-500 text-red-500" /> : <Heart className="h-4 w-4" />}
          </Button>
        </div>

        {listing.imageUrl && (
          <img src={listing.imageUrl} alt={listing.title} className="w-full max-h-80 object-cover rounded-lg" />
        )}

        {listing.description && <p className="text-muted-foreground">{listing.description}</p>}

        <div className="flex flex-wrap gap-1">
          <span className="text-xs bg-muted px-2 py-1 rounded">{listing.category}</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">{listing.type}</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">{listing.status}</span>
        </div>

        {listing.price && <p className="text-xl font-bold">₹{listing.price}</p>}
        {listing.location && <p className="text-sm text-muted-foreground">Location: {listing.location}</p>}
        <p className="text-sm text-muted-foreground">Seller: {listing.seller.name}</p>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!isOwner && listing.status === "AVAILABLE" && (
          <Button onClick={handleBuy}>Buy Karo</Button>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Chat (Price Negotiation)</h2>

        <div className="border rounded-lg p-3 h-64 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Koi message nahi hai abhi</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium">{m.sender.name}: </span>
                <span>{m.content}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Message likho..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit">Bhejo</Button>
        </form>
      </div>
    </div>
  )
}