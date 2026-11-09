
"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { ReportButton } from "@/components/report-button"
import { WhatsAppShare } from "@/components/whatsapp-share"
import { BlockUserButton } from "@/components/block-user-button"
import { FullImage } from "@/components/full-image"

type Listing = {
  id: number
  title: string
  description: string | null
  category: string
  type: string
  sellerId: number
  price: number | null
  imageUrl: string | null
  images: { id: number; imageUrl: string }[]
  location: string | null
  status: string
  seller: { id: number; name: string; phone: string | null }
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
  const listingId = params.id

  const { data: session } = useSession()

  const [listing, setListing] = useState<Listing | null>(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState("")
  const [marking, setMarking] = useState(false)
  const [buying, setBuying] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then((r) => r.json())
      .then(setListing)

    fetch(`/api/listings/${listingId}/wishlist`)
      .then((r) => r.json())
      .then((d) => setWishlisted(d.wishlisted))

    loadMessages()
  }, [listingId])

  async function loadMessages() {
    const res = await fetch(`/api/listings/${listingId}/chat`)
    const data = await res.json()
    setMessages(data)
  }

  async function handleWishlistToggle() {
    const res = await fetch(`/api/listings/${listingId}/wishlist`, {
      method: "POST",
    })

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

  async function handleDelete() {
    if (!confirm("Delete this listing permanently?")) return

    const res = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
    })

    if (res.ok) router.push("/marketplace")
  }

  async function handleMarkSold() {
    if (
      !confirm(
        "Mark this item as sold? It will be removed from the marketplace listing."
      )
    )
      return

    setMarking(true)

    const res = await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SOLD" }),
    })

    setMarking(false)

    if (res.ok) {
      router.refresh()
      setListing((prev) =>
        prev ? { ...prev, status: "SOLD" } : prev
      )
    }
  }

  if (!listing) {
    return <p className="text-muted-foreground">Loading...</p>
  }

  const isOwner =
    (session?.user as any)?.id === listing.seller.id.toString()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4">
        {/* Title + Wishlist */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{listing.title}</h1>

          <Button
            variant="outline"
            size="icon"
            onClick={handleWishlistToggle}
          >
            {wishlisted ? (
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Updated FullImage Gallery */}
        {(() => {
          const urls = listing.images?.length
            ? listing.images.map((i) => i.imageUrl)
            : listing.imageUrl
              ? [listing.imageUrl]
              : []

          if (urls.length === 0) return null

          return (
            <div className="space-y-2">
              <FullImage
                src={urls[0]}
                alt={listing.title}
                ratio="aspect-[4/3]"
                zoom
                className="rounded-xl border"
              />

              {urls.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {urls.slice(1).map((u) => (
                    <FullImage
                      key={u}
                      src={u}
                      alt={listing.title}
                      ratio="aspect-square"
                      zoom
                      className="rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* Description */}
        {listing.description && (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {listing.description}
          </p>
        )}

        {/* Category, Type, Status */}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs bg-muted px-2 py-1 rounded">
            {listing.category}
          </span>

          <span className="text-xs bg-muted px-2 py-1 rounded">
            {listing.type}
          </span>

          <span className="text-xs bg-muted px-2 py-1 rounded">
            {listing.status}
          </span>
        </div>

        {/* Price */}
        {listing.price != null && (
          <p className="text-xl font-bold">₹{listing.price}</p>
        )}

        {/* Location */}
        {listing.location && (
          <p className="text-sm text-muted-foreground">
            Location: {listing.location}
          </p>
        )}

        {/* Seller */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Seller: {listing.seller.name}
          </p>

          {listing.seller.phone && (
            <p className="text-sm text-muted-foreground">
              📞 {listing.seller.phone}
            </p>
          )}
        </div>

        {/* Block + Report */}
        <div className="flex flex-wrap gap-2">
          <BlockUserButton targetUserId={listing.seller.id} />

          <ReportButton
            type="LISTING"
            targetId={listing.id}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Item unavailable */}
        {!isOwner && listing.status !== "AVAILABLE" && (
          <Button disabled variant="outline" className="w-full">
            Item No Longer Available
          </Button>
        )}

        {/* Mark Sold */}
        {isOwner && listing.status === "AVAILABLE" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMarkSold}
            disabled={marking}
          >
            {marking ? "Updating..." : "Mark as Sold"}
          </Button>
        )}

        {/* Delete Listing */}
        {isOwner && (
          <Button
            variant="outline"
            className="text-red-500 border-red-300"
            onClick={handleDelete}
          >
            Delete Listing
          </Button>
        )}
      </div>

      {/* WhatsApp Share */}
      <WhatsAppShare
        text={`Check out "${listing.title}" on CampusHub Marketplace`}
        url={
          typeof window !== "undefined"
            ? window.location.href
            : ""
        }
      />

      {/* Chat */}
      <div className="space-y-3 pb-16">
        <h2 className="font-semibold">
          Chat (Price Negotiation)
        </h2>

        <div className="border rounded-lg p-3 h-64 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No message available yet, check back after some time
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-medium">
                  {m.sender.name}:{" "}
                </span>

                <span>{m.content}</span>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Send Message */}
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 items-center"
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="h-9"
          />

          <Button
            type="submit"
            size="sm"
            className="shrink-0"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
