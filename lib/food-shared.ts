import { getISTParts, normalizeHHMM } from "@/lib/time-utils"

export const VENDOR_TYPES = ["MESS", "TIFFIN", "CANTEEN", "RESTAURANT", "CAFE", "OTHER"] as const
export const DIETS = ["VEG", "NON_VEG", "EGG"] as const

export const VENDOR_TYPE_LABELS: Record<string, string> = {
  MESS: "Mess",
  TIFFIN: "Tiffin",
  CANTEEN: "Canteen",
  RESTAURANT: "Restaurant",
  CAFE: "Cafe",
  OTHER: "Other",
}

export const DIET_LABELS: Record<string, string> = {
  VEG: "Veg",
  NON_VEG: "Non-Veg",
  EGG: "Egg",
}

export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "")
  return digits.length === 10 ? `91${digits}` : digits
}

export function whatsappLink(phone: string, message: string) {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`
}

export function buildOrderMessage(vendorName: string, itemName?: string | null) {
  const what = itemName ? `Mujhe "${itemName}" order karna hai.` : "Mujhe order/enquiry karni hai."
  return `Hi ${vendorName}, main CampusHub se bol raha/rahi hoon. ${what} Please availability, price aur delivery/pickup details bata dijiye.`
}

// Client-side: order tap ko log karta hai (analytics) aur WhatsApp kholta hai
export function openWhatsAppOrder(
  vendor: { id: number; name: string; phone: string; whatsapp?: string | null },
  itemName?: string | null
) {
  fetch(`/api/food/vendors/${vendor.id}/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "ORDER_CLICK", itemName: itemName ?? null }),
    keepalive: true,
  }).catch(() => {})

  window.open(
    whatsappLink(vendor.whatsapp || vendor.phone, buildOrderMessage(vendor.name, itemName)),
    "_blank",
    "noopener,noreferrer"
  )
}

export function computeOpenNow(v: { isOpenNow: boolean; openTime: string | null; closeTime: string | null }) {
  if (!v.isOpenNow) return false
  if (!v.openTime || !v.closeTime) return true

  const { hhmm } = getISTParts()
  const open = normalizeHHMM(v.openTime)
  const close = normalizeHHMM(v.closeTime)

  if (open <= close) return hhmm >= open && hhmm < close
  return hhmm >= open || hhmm < close // raat ko band hone wale (jaise 18:00 - 02:00)
}