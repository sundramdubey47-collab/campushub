"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combobox"
import { Heart } from "lucide-react"

const CATEGORY_OPTIONS = [
  { value: "BOOKS", label: "Books" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "CYCLE", label: "Cycle" },
  { value: "CALCULATOR", label: "Calculator" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "HOSTEL_ITEMS", label: "Hostel Items" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "OTHER", label: "Other" },
]

type Listing = {
  id: number
  title: string
  description: string | null
  category: string
  type: string
  price: number | null
  imageUrl: string | null
  location: string | null
  seller: { name: string }
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  async function loadListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (category) params.set("category", category)

    const res = await fetch(`/api/listings?${params.toString()}`)
    const data = await res.json()
    setListings(data)
    setLoading(false)
  }

  useEffect(() => {
    loadListings()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Marketplace</h1>
  <div className="flex gap-2">
    <Link href="/marketplace/orders">
      <Button variant="outline">Meri Orders</Button>
    </Link>
    <Link href="/marketplace/create">
      <Button>Item List Karo</Button>
    </Link>
  </div>
</div>

      <div className="flex gap-2">
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Combobox placeholder="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        <Button onClick={loadListings}>Search</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Load ho raha hai...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">Koi item nahi mila</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => (
            <Link key={item.id} href={`/marketplace/${item.id}`}>
              <div className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{item.title}</h2>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{item.type}</span>
                  </div>
                  {item.price && <p className="font-bold">₹{item.price}</p>}
                  <p className="text-xs text-muted-foreground">By {item.seller.name}</p>
                  {item.location && <p className="text-xs text-muted-foreground">{item.location}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}