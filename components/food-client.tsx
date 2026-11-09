
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { DietMark } from "@/components/diet-mark"
import { FullImage } from "@/components/full-image"
import {
  VENDOR_TYPE_LABELS,
  openWhatsAppOrder,
} from "@/lib/food-shared"
import {
  Utensils,
  Search,
  Star,
  Clock,
  MapPin,
  Settings,
  MessageCircle,
  Bike,
} from "lucide-react"

export type FoodVendorCard = {
  id: number
  name: string
  type: string
  area: string | null
  imageUrl: string | null
  openTime: string | null
  closeTime: string | null
  isVegOnly: boolean
  hasDelivery: boolean
  monthlyPrice: number | null
  phone: string
  whatsapp: string | null
  isOpen: boolean
  avgRating: number | null
  ratingCount: number
}

export type FoodSpecial = {
  id: number
  name: string
  price: number
  diet: string
  vendor: {
    id: number
    name: string
    phone: string
    whatsapp: string | null
  }
}

type DishResult = {
  id: number
  name: string
  price: number
  diet: string
  vendor: {
    id: number
    name: string
    phone: string
    whatsapp: string | null
    area: string | null
    isOpen: boolean
  }
}

type PlaceResult = {
  id: number
  name: string
  type: string
  area: string | null
  isOpen: boolean
}

type SearchResponse = {
  dishes?: DishResult[]
  vendors?: PlaceResult[]
}

const TYPE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "MESS", label: "Mess" },
  { value: "TIFFIN", label: "Tiffin" },
  { value: "CANTEEN", label: "Canteen" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "CAFE", label: "Cafe" },
]

function getVendorType(type: string) {
  return (
    VENDOR_TYPE_LABELS[
      type as keyof typeof VENDOR_TYPE_LABELS
    ] ?? type
  )
}

function OpenPill({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        isOpen
          ? "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isOpen ? "Open" : "Closed"}
    </span>
  )
}

export function FoodClient({
  vendors,
  specials,
  canManage,
}: {
  vendors: FoodVendorCard[]
  specials: FoodSpecial[]
  canManage: boolean
}) {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [vegOnly, setVegOnly] = useState(false)
  const [openOnly, setOpenOnly] = useState(false)

  const [dishes, setDishes] = useState<DishResult[]>([])
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState("")

  const searchActive = query.trim().length >= 2

  // Search dishes and food places
  useEffect(() => {
    if (!searchActive) {
      setDishes([])
      setPlaces([])
      setSearching(false)
      setSearchError("")
      return
    }

    let cancelled = false

    const controller = new AbortController()

    setSearching(true)
    setSearchError("")

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/food/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        )

        if (!res.ok) {
          throw new Error("Search request failed")
        }

        const data: SearchResponse = await res.json()

        if (!cancelled) {
          setDishes(
            Array.isArray(data.dishes) ? data.dishes : []
          )

          setPlaces(
            Array.isArray(data.vendors) ? data.vendors : []
          )
        }
      } catch (error) {
        if (
          !cancelled &&
          !(error instanceof Error && error.name === "AbortError")
        ) {
          setDishes([])
          setPlaces([])
          setSearchError("Unable to search. Please try again.")
        }
      } finally {
        if (!cancelled) {
          setSearching(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, searchActive])

  // Filter food vendors
  const filteredVendors = vendors.filter(
    (vendor) =>
      (typeFilter === "ALL" || vendor.type === typeFilter) &&
      (!vegOnly || vendor.isVegOnly) &&
      (!openOnly || vendor.isOpen)
  )

  // Filter searched dishes
  const filteredDishes = dishes.filter(
    (dish) =>
      (!vegOnly || dish.diet === "VEG") &&
      (!openOnly || dish.vendor.isOpen)
  )

  // Filter searched places
  const filteredPlaces = places.filter(
    (place) =>
      (typeFilter === "ALL" || place.type === typeFilter) &&
      (!openOnly || place.isOpen)
  )

  return (
    <div className="max-w-5xl space-y-5">

      {/* Page Header */}
      <PageHeader
        title="Food & Mess"
        description="Mess, tiffin, canteen and restaurants around your campus"
        action={
          canManage ? (
            <Link href="/food/manage">
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-1.5" />
                Manage
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a dish or place — pizza, thali, paratha..."
          className="pl-9 h-11"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">

        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setTypeFilter(filter.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              typeFilter === filter.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}

        <label className="flex items-center gap-1.5 text-xs ml-1 cursor-pointer">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
          />
          Veg only
        </label>

        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          Open now
        </label>

      </div>

      {/* Search Results */}
      {searchActive ? (
        <div className="space-y-5">

          {searching && (
            <p className="text-sm text-muted-foreground">
              Searching...
            </p>
          )}

          {searchError && (
            <p className="text-sm text-red-500">
              {searchError}
            </p>
          )}

          {!searching &&
            !searchError &&
            filteredDishes.length === 0 &&
            filteredPlaces.length === 0 && (
              <EmptyState
                icon={Utensils}
                title="Nothing found"
                description="Try a different dish name, or clear the search to browse all places."
              />
            )}

          {/* Dish Results */}
          {filteredDishes.length > 0 && (
            <div className="space-y-2">

              <h2 className="font-semibold text-sm">
                Dishes (cheapest first)
              </h2>

              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="rounded-xl border bg-card p-3 flex items-center gap-3"
                >

                  <DietMark diet={dish.diet} />

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium truncate">
                      {dish.name}
                    </p>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">

                      <Link
                        href={`/food/${dish.vendor.id}`}
                        className="underline underline-offset-2"
                      >
                        {dish.vendor.name}
                      </Link>

                      {dish.vendor.area && (
                        <span>• {dish.vendor.area}</span>
                      )}

                      <OpenPill isOpen={dish.vendor.isOpen} />

                    </p>

                  </div>

                  <span className="font-bold text-sm shrink-0">
                    ₹{dish.price}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      openWhatsAppOrder(dish.vendor, dish.name)
                    }
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1" />
                    Order
                  </Button>

                </div>
              ))}

            </div>
          )}

          {/* Place Results */}
          {filteredPlaces.length > 0 && (
            <div className="space-y-2">

              <h2 className="font-semibold text-sm">
                Places
              </h2>

              {filteredPlaces.map((place) => (
                <Link
                  key={place.id}
                  href={`/food/${place.id}`}
                  className="block"
                >
                  <div className="rounded-xl border bg-card p-3 flex items-center justify-between hover:border-primary/40 transition-colors">

                    <div>
                      <p className="text-sm font-medium">
                        {place.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {getVendorType(place.type)}
                        {place.area ? ` • ${place.area}` : ""}
                      </p>
                    </div>

                    <OpenPill isOpen={place.isOpen} />

                  </div>
                </Link>
              ))}

            </div>
          )}

        </div>
      ) : (

        <>
          {/* Today's Specials */}
          {specials.length > 0 && (
            <div className="space-y-2">

              <h2 className="font-semibold text-sm">
                🔥 Today's Specials
              </h2>

              <div className="flex gap-3 overflow-x-auto pb-1">

                {specials.map((special) => (
                  <div
                    key={special.id}
                    className="shrink-0 w-52 rounded-xl border bg-gradient-to-br from-primary/5 to-card p-3 space-y-1.5"
                  >

                    <div className="flex items-center gap-1.5">

                      <DietMark diet={special.diet} />

                      <p className="text-sm font-semibold truncate">
                        {special.name}
                      </p>

                    </div>

                    <p className="text-xs text-muted-foreground truncate">
                      {special.vendor.name}
                    </p>

                    <div className="flex items-center justify-between">

                      <span className="font-bold text-sm">
                        ₹{special.price}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppOrder(
                            special.vendor,
                            special.name
                          )
                        }
                        className="text-xs font-medium text-primary flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Order
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            </div>
          )}

          {/* Food Vendor Listing */}
          {filteredVendors.length === 0 ? (

            <EmptyState
              icon={Utensils}
              title={
                vendors.length === 0
                  ? "No food places added yet"
                  : "No places match your filters"
              }
              description={
                vendors.length === 0
                  ? "Mess, tiffin and canteen listings for your campus will show up here soon"
                  : "Try removing a filter"
              }
            />

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {filteredVendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/food/${vendor.id}`}
                  className="block h-full"
                >

                  <div className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">

                    {/* Vendor Image */}
                    <div className="h-32 bg-gradient-to-br from-primary/15 to-muted flex items-center justify-center overflow-hidden">

                      {vendor.imageUrl ? (
                        <FullImage
                          src={vendor.imageUrl}
                          alt={vendor.name}
                          natural
                          zoom
                          className="w-full h-full"
                        />
                      ) : (
                        <Utensils className="h-8 w-8 text-primary/40" />
                      )}

                    </div>

                    {/* Vendor Details */}
                    <div className="p-4 space-y-2">

                      <div className="flex items-start justify-between gap-2">

                        <h2 className="font-semibold text-sm leading-snug">
                          {vendor.name}
                        </h2>

                        <OpenPill isOpen={vendor.isOpen} />

                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">

                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
                          {getVendorType(vendor.type)}
                        </span>

                        {vendor.isVegOnly && (
                          <span className="text-[10px] bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))] px-2 py-0.5 rounded-full">
                            Pure Veg
                          </span>
                        )}

                        {vendor.hasDelivery && (
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Bike className="h-2.5 w-2.5" />
                            Delivery
                          </span>
                        )}

                      </div>

                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">

                        {vendor.area && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {vendor.area}
                          </span>
                        )}

                        {vendor.openTime && vendor.closeTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {vendor.openTime} – {vendor.closeTime}
                          </span>
                        )}

                      </div>

                      <div className="flex items-center justify-between pt-1 border-t">

                        <span className="text-xs flex items-center gap-1">

                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />

                          {vendor.avgRating !== null
                            ? `${vendor.avgRating.toFixed(1)} (${vendor.ratingCount})`
                            : "New"}

                        </span>

                        {vendor.monthlyPrice !== null &&
                          vendor.monthlyPrice > 0 && (
                            <span className="text-xs font-semibold">
                              from ₹{vendor.monthlyPrice}/month
                            </span>
                          )}

                      </div>

                    </div>

                  </div>

                </Link>
              ))}

            </div>

          )}

        </>

      )}

    </div>
  )
}
