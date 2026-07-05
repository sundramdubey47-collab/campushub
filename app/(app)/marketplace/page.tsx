"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combobox"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, Search, Plus, Receipt, MapPin } from "lucide-react"

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
    <div className="space-y-5">
      <PageHeader
        title="Marketplace"
        description="Buy, sell, or exchange with students on your own campus"
        action={
          <div className="flex gap-2">
            <Link href="/marketplace/orders">
              <Button variant="outline" size="sm"><Receipt className="h-4 w-4 mr-1.5" /> My Orders</Button>
            </Link>
            <Link href="/marketplace/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Sell an Item</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for anything..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Combobox placeholder="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        <Button onClick={loadListings}>Search</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nothing listed yet"
          description="Got something to sell? Be the first to list an item on your campus marketplace"
          action={
            <Link href="/marketplace/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> List an Item</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              whileHover={{ y: -3 }}
            >
              <Link href={`/marketplace/${item.id}`}>
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h2 className="font-medium text-sm truncate">{item.title}</h2>
                      <span className="shrink-0 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{item.type}</span>
                    </div>
                    {item.price && <p className="font-bold text-sm">₹{item.price}</p>}
                    <p className="text-[11px] text-muted-foreground truncate">by {item.seller.name}</p>
                    {item.location && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" /> {item.location}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}