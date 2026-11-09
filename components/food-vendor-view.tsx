
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DietMark } from "@/components/diet-mark"
import { FullImage } from "@/components/full-image"
import { VENDOR_TYPE_LABELS, openWhatsAppOrder } from "@/lib/food-shared"
import {
  Utensils,
  Star,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Bike,
  Settings,
  Info,
} from "lucide-react"

type Vendor = {
  id: number
  name: string
  type: string
  description: string | null
  area: string | null
  address: string | null
  phone: string
  whatsapp: string | null
  openTime: string | null
  closeTime: string | null
  imageUrl: string | null
  isVegOnly: boolean
  hasDelivery: boolean
  deliveryNote: string | null
  monthlyPrice: number | null
  trialMealPrice: number | null
  weeklyMenu: string | null
  isOpen: boolean
}

type Item = {
  id: number
  name: string
  description: string | null
  price: number
  diet: string
  category: string | null
  isAvailable: boolean
  isSpecial: boolean
}

type RatingInfo = {
  avg: number | null
  count: number
}

export function FoodVendorView({
  vendor,
  items,
  rating,
  myRating,
  canManage,
  isOwnPlace,
}: {
  vendor: Vendor
  items: Item[]
  rating: RatingInfo
  myRating: number | null
  canManage: boolean
  isOwnPlace: boolean
}) {
  const [trialState, setTrialState] = useState<
    "idle" | "sending" | "done"
  >("idle")

  const [ratingInfo, setRatingInfo] = useState<RatingInfo>(rating)
  const [mine, setMine] = useState(myRating ?? 0)
  const [hover, setHover] = useState(0)
  const [ratingError, setRatingError] = useState("")
  const [ratingLoading, setRatingLoading] = useState(false)

  const isMess =
    vendor.type === "MESS" || vendor.type === "TIFFIN"

  const vendorType =
    VENDOR_TYPE_LABELS[
      vendor.type as keyof typeof VENDOR_TYPE_LABELS
    ] ?? vendor.type

  const groups = items.reduce<Record<string, Item[]>>(
    (acc, item) => {
      const key = item.category || "Menu"

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(item)
      return acc
    },
    {}
  )

  async function requestTrial() {
    if (trialState !== "idle") return

    setTrialState("sending")

    try {
      const res = await fetch(
        `/api/food/vendors/${vendor.id}/enquire`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            kind: "TRIAL_REQUEST",
          }),
        }
      )

      if (!res.ok) {
        throw new Error("Request failed")
      }

      setTrialState("done")
    } catch {
      setTrialState("idle")
      alert("Unable to send request. Please try again.")
    }
  }

  async function rate(value: number) {
    if (ratingLoading) return

    setRatingError("")
    setRatingLoading(true)

    try {
      const res = await fetch(
        `/api/food/vendors/${vendor.id}/rating`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setRatingError(
          data.error || "Unable to submit rating."
        )
        return
      }

      setMine(value)

      setRatingInfo({
        avg: data.avg,
        count: data.count,
      })
    } catch {
      setRatingError(
        "Something went wrong. Please try again."
      )
    } finally {
      setRatingLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Vendor Header */}
      <div className="rounded-2xl border bg-card overflow-hidden">

        <div className="h-44 bg-gradient-to-br from-primary/15 to-muted flex items-center justify-center overflow-hidden">
          {vendor.imageUrl ? (
            <FullImage
              src={vendor.imageUrl}
              alt={vendor.name}
              natural
              zoom
              className="w-full h-full"
            />
          ) : (
            <Utensils className="h-10 w-10 text-primary/40" />
          )}
        </div>

        <div className="p-5 space-y-3">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">
              <h1 className="text-xl font-bold">
                {vendor.name}
              </h1>

              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">

                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
                  {vendorType}
                </span>

                {vendor.isVegOnly && (
                  <span className="text-[10px] bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))] px-2 py-0.5 rounded-full">
                    Pure Veg
                  </span>
                )}

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    vendor.isOpen
                      ? "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {vendor.isOpen ? "Open now" : "Closed"}
                </span>

              </div>
            </div>

            <div className="text-right shrink-0">

              <p className="text-sm font-semibold flex items-center gap-1 justify-end">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                {ratingInfo.avg !== null
                  ? ratingInfo.avg.toFixed(1)
                  : "New"}
              </p>

              <p className="text-[11px] text-muted-foreground">
                {ratingInfo.count} rating
                {ratingInfo.count !== 1 ? "s" : ""}
              </p>

            </div>

          </div>

          {vendor.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {vendor.description}
            </p>
          )}

          {/* Vendor Information */}
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">

            {(vendor.area || vendor.address) && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                {[vendor.area, vendor.address]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            )}

            {vendor.openTime && vendor.closeTime && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                {vendor.openTime} – {vendor.closeTime}
              </span>
            )}

            {vendor.hasDelivery && (
              <span className="flex items-center gap-2">
                <Bike className="h-4 w-4 shrink-0" />
                Delivery available
                {vendor.deliveryNote
                  ? ` — ${vendor.deliveryNote}`
                  : ""}
              </span>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">

            <a
              href={`tel:+91${vendor.phone}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>

            <Button
              size="sm"
              className="h-9"
              onClick={() => openWhatsAppOrder(vendor)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </Button>

            {canManage && (
              <Link href={`/food/${vendor.id}/manage`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9"
                >
                  <Settings className="h-4 w-4 mr-1.5" />
                  Manage
                </Button>
              </Link>
            )}

          </div>

        </div>
      </div>

      {/* Mess / Tiffin Monthly Plan */}
      {isMess &&
        (vendor.monthlyPrice ||
          vendor.trialMealPrice ||
          vendor.weeklyMenu) && (
          <div className="rounded-2xl border bg-card p-5 space-y-3">

            <h2 className="font-semibold text-sm">
              Monthly Plan
            </h2>

            <div className="flex flex-wrap gap-4">

              {vendor.monthlyPrice !== null &&
                vendor.monthlyPrice !== 0 && (
                  <div>
                    <p className="text-2xl font-bold">
                      ₹{vendor.monthlyPrice}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      per month
                    </p>
                  </div>
                )}

              {vendor.trialMealPrice !== null &&
                vendor.trialMealPrice !== 0 && (
                  <div>
                    <p className="text-2xl font-bold">
                      ₹{vendor.trialMealPrice}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      trial meal
                    </p>
                  </div>
                )}

            </div>

            {vendor.weeklyMenu && (
              <div className="rounded-lg bg-muted/40 p-3">

                <p className="text-xs font-semibold mb-1">
                  This week's menu
                </p>

                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {vendor.weeklyMenu}
                </p>

              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={requestTrial}
              disabled={trialState !== "idle"}
            >
              {trialState === "idle" &&
                "Request a Trial Meal"}

              {trialState === "sending" &&
                "Sending..."}

              {trialState === "done" &&
                "Request sent ✅"}
            </Button>

          </div>
        )}

      {/* Food Menu */}
      {items.length > 0 && (
        <div className="space-y-4">

          {Object.entries(groups).map(
            ([category, list]) => (
              <div
                key={category}
                className="rounded-2xl border bg-card p-4 space-y-1"
              >

                <h2 className="font-semibold text-sm pb-2">
                  {category}
                </h2>

                {list.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 border-t py-2.5 ${
                      item.isAvailable
                        ? ""
                        : "opacity-50"
                    }`}
                  >

                    <DietMark diet={item.diet} />

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                        {item.name}

                        {item.isSpecial && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            Special
                          </span>
                        )}
                      </p>

                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}

                    </div>

                    <span className="font-bold text-sm shrink-0">
                      ₹{item.price}
                    </span>

                    {item.isAvailable ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0"
                        onClick={() =>
                          openWhatsAppOrder(
                            vendor,
                            item.name
                          )
                        }
                      >
                        Order
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        Not today
                      </span>
                    )}

                  </div>
                ))}

              </div>
            )
          )}

        </div>
      )}

      {/* Rating Section */}
      {!isOwnPlace && (
        <div className="rounded-2xl border bg-card p-5 space-y-2">

          <h2 className="font-semibold text-sm">
            Rate this place
          </h2>

          <div
            className="flex gap-1"
            onMouseLeave={() => setHover(0)}
          >

            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={ratingLoading}
                onMouseEnter={() => setHover(n)}
                onClick={() => rate(n)}
                aria-label={`${n} star`}
                aria-pressed={mine === n}
                className="disabled:opacity-50"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    n <= (hover || mine)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}

          </div>

          {ratingLoading && (
            <p className="text-xs text-muted-foreground">
              Submitting rating...
            </p>
          )}

          {ratingError && (
            <p className="text-xs text-red-500">
              {ratingError}
            </p>
          )}

        </div>
      )}

      {/* Disclaimer */}
      <p className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed px-1">

        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />

        Orders, payment and delivery are handled directly
        between you and the vendor. CampusHub only lists
        places and does not take responsibility for food
        quality or transactions. Check availability before
        you pay.

      </p>

    </div>
  )
}
