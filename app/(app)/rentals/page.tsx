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
import { Package, Plus, History, Search } from "lucide-react"

const CATEGORY_OPTIONS = [
  { value: "BOOKS", label: "Books" },
  { value: "LAPTOP", label: "Laptop" },
  { value: "PROJECTOR", label: "Projector" },
  { value: "CALCULATOR", label: "Calculator" },
  { value: "CAMERA", label: "Camera" },
  { value: "CYCLE", label: "Cycle" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "OTHER", label: "Other" },
]

type Item = {
  id: number
  title: string
  description: string | null
  category: string
  pricingType: string
  price: number
  securityDeposit: number
  imageUrl: string | null
  owner: { name: string }
}

export default function RentalsPage() {
  const [allItems, setAllItems] = useState<Item[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    fetch("/api/rentals")
      .then((r) => r.json())
      .then((data) => {
        setAllItems(data)
        setItems(data)
        setLoading(false)
      })
  }, [])

  function applyFilters() {
    let filtered = allItems

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      )
    }

    if (category) {
      filtered = filtered.filter((i) => i.category === category)
    }

    setItems(filtered)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rentals"
        description="Borrow what you need — books, gear, and more, without buying"
        action={
          <div className="flex gap-2">
            <Link href="/rentals/my-bookings">
              <Button variant="outline" size="sm"><History className="h-4 w-4 mr-1.5" /> My Rentals</Button>
            </Link>
            <Link href="/rentals/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> List an Item</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rentals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Combobox placeholder="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        <Button onClick={applyFilters}>Search</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No items found"
          description="Try different filters, or be the first to list an item"
          action={
            <Link href="/rentals/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> List an Item</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link href={`/rentals/${item.id}`}>
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {item.imageUrl && (
                    <div className="aspect-video bg-muted overflow-hidden flex items-center justify-center">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h2 className="font-semibold text-sm">{item.title}</h2>
                    {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                    <p className="font-bold text-sm">
                      ₹{item.price} <span className="font-normal text-muted-foreground">/ {item.pricingType.toLowerCase()}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Owned by {item.owner.name}</p>
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