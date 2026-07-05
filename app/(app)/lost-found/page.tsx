"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

type Item = {
  id: number
  type: string
  title: string
  description: string | null
  imageUrl: string | null
  location: string | null
  contactNumber: string | null
  reward: string | null
  createdAt: string
  reportedBy: { id: number; name: string }
}

export default function LostFoundPage() {
  const { data: session } = useSession()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  async function loadItems() {
    setLoading(true)
    const res = await fetch("/api/lost-found")
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function handleResolve(id: number) {
    await fetch(`/api/lost-found/${id}/resolve`, { method: "POST" })
    loadItems()
  }

  const currentUserId = (session?.user as any)?.id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lost & Found</h1>
        <Link href="/lost-found/report">
          <Button>Report Karo</Button>
        </Link>
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
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{item.title}</h2>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.type === "LOST" ? "bg-red-500/20 text-red-600" : "bg-green-500/20 text-green-600"
                    }`}
                  >
                    {item.type === "LOST" ? "Khoya Hai" : "Mila Hai"}
                  </span>
                </div>

                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                {item.location && <p className="text-sm text-muted-foreground">Location: {item.location}</p>}
                {item.contactNumber && <p className="text-sm font-medium">Contact: {item.contactNumber}</p>}
                {item.reward && <p className="text-sm text-green-600">Reward: {item.reward}</p>}
                <p className="text-xs text-muted-foreground">By {item.reportedBy.name}</p>

                {item.reportedBy.id.toString() === currentUserId && (
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => handleResolve(item.id)}>
                    Mil Gaya - Resolve Karo
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}