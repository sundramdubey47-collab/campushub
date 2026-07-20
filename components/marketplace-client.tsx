"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/combobox"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"

import {
  ShoppingBag,
  Search,
  Plus,
  Receipt,
  MapPin,
  Sparkles,
  Store,
  Filter,
} from "lucide-react"

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
  seller: {
    name: string
  }
}

export function MarketplaceClient({
  initialListings,
}: {
  initialListings: Listing[]
}) {
  const [allListings] = useState(initialListings)
  const [listings, setListings] = useState(initialListings)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  function applyFilters() {
    let filtered = allListings

    if (search.trim()) {
      const q = search.toLowerCase()

      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q)
      )
    }

    if (category) {
      filtered = filtered.filter(
        (l) => l.category === category
      )
    }

    setListings(filtered)
  }

  return (
    <div className="space-y-8">

  <PageHeader
    title="Marketplace"
    description="Buy, sell and exchange items with students from your own campus."
    action={
      <div className="flex flex-wrap gap-2">

        <Link href="/marketplace/orders">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            <Receipt className="mr-2 h-4 w-4" />
            My Orders
          </Button>
        </Link>

        <Link href="/marketplace/create">
          <Button
            size="sm"
            className="rounded-xl shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Sell an Item
          </Button>
        </Link>

      </div>
    }
  />

  {/* Hero */}

  <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-background p-8">

    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex items-start gap-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Store className="h-8 w-8" />
        </div>

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Campus Marketplace
          </div>

          <h2 className="text-3xl font-bold">
            Find Amazing Deals
          </h2>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Buy books, electronics, hostel essentials, cycles,
            furniture and much more from students in your college.
          </p>

        </div>

      </div>

     

    </div>

  </div>

  {/* Search */}

  <div className="rounded-3xl border bg-card p-6 shadow-sm">

    <div className="mb-5 flex items-center gap-2">

      <Filter className="h-5 w-5 text-primary" />

      <h3 className="font-semibold">
        Search Marketplace
      </h3>

    </div>

    <div className="grid gap-4 lg:grid-cols-[1fr_240px_auto]">

      <div className="relative">

        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search books, laptops, furniture..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-10"
        />

      </div>

      <Combobox
        placeholder="Select Category"
        value={category}
        onChange={setCategory}
        options={CATEGORY_OPTIONS}
      />

      <Button
        onClick={applyFilters}
        className="h-11 rounded-xl px-8"
      >
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>

    </div>

  </div>
    {listings.length === 0 ? (
    <div className="rounded-3xl border bg-card p-10 shadow-sm">
      <EmptyState
        icon={ShoppingBag}
        title="Nothing listed yet"
        description="Be the first student to list an item and start your campus marketplace."
        action={
          <Link href="/marketplace/create">
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              List an Item
            </Button>
          </Link>
        }
      />
    </div>
  ) : (
    <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {listings.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: Math.min(i * 0.04, 0.3),
          }}
          whileHover={{
            y: -6,
          }}
        >
          <Link href={`/marketplace/${item.id}`}>

            <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-xl">

              {/* Image */}

              <div className="relative aspect-square overflow-hidden bg-muted">

                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold shadow">
                  {item.type}
                </div>

                {item.price && (
                  <div className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                    ₹{item.price}
                  </div>
                )}

              </div>

              {/* Content */}

              <div className="space-y-3 p-4">

                <div>

                  <h3 className="line-clamp-1 font-semibold">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                </div>

                <div className="flex items-center justify-between">

                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                    {CATEGORY_OPTIONS.find(
                      (c) => c.value === item.category
                    )?.label ?? item.category}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {item.seller.name}
                  </span>

                </div>

                {item.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {item.location}
                    </span>
                  </div>
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