"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"
import { VENDOR_TYPES, VENDOR_TYPE_LABELS } from "@/lib/food-shared"

export type VendorFormValues = {
  name: string
  type: string
  description: string
  area: string
  address: string
  phone: string
  whatsapp: string
  openTime: string
  closeTime: string
  isVegOnly: boolean
  hasDelivery: boolean
  deliveryNote: string
  monthlyPrice: string
  trialMealPrice: string
  weeklyMenu: string
}

export const emptyVendorValues: VendorFormValues = {
  name: "",
  type: "MESS",
  description: "",
  area: "",
  address: "",
  phone: "",
  whatsapp: "",
  openTime: "",
  closeTime: "",
  isVegOnly: false,
  hasDelivery: false,
  deliveryNote: "",
  monthlyPrice: "",
  trialMealPrice: "",
  weeklyMenu: "",
}

export function vendorValuesToPayload(v: VendorFormValues) {
  const n = (s: string) => (s.trim() === "" ? null : s.trim())
  return {
    name: v.name.trim(),
    type: v.type,
    description: n(v.description),
    area: n(v.area),
    address: n(v.address),
    phone: v.phone.trim(),
    whatsapp: n(v.whatsapp),
    openTime: n(v.openTime),
    closeTime: n(v.closeTime),
    isVegOnly: v.isVegOnly,
    hasDelivery: v.hasDelivery,
    deliveryNote: n(v.deliveryNote),
    monthlyPrice: n(v.monthlyPrice),
    trialMealPrice: n(v.trialMealPrice),
    weeklyMenu: n(v.weeklyMenu),
  }
}

export function vendorValuesToFormData(v: VendorFormValues, image: File | null, notifyStudents: boolean) {
  const fd = new FormData()
  fd.append("name", v.name)
  fd.append("type", v.type)
  fd.append("description", v.description)
  fd.append("area", v.area)
  fd.append("address", v.address)
  fd.append("phone", v.phone)
  fd.append("whatsapp", v.whatsapp)
  fd.append("openTime", v.openTime)
  fd.append("closeTime", v.closeTime)
  fd.append("isVegOnly", v.isVegOnly ? "true" : "false")
  fd.append("hasDelivery", v.hasDelivery ? "true" : "false")
  fd.append("deliveryNote", v.deliveryNote)
  fd.append("monthlyPrice", v.monthlyPrice)
  fd.append("trialMealPrice", v.trialMealPrice)
  fd.append("weeklyMenu", v.weeklyMenu)
  fd.append("notifyStudents", notifyStudents ? "true" : "false")
  if (image) fd.append("image", image)
  return fd
}

export function VendorFormFields({
  values,
  onChange,
}: {
  values: VendorFormValues
  onChange: (patch: Partial<VendorFormValues>) => void
}) {
  const showMonthly = values.type === "MESS" || values.type === "TIFFIN"

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Name *</Label>
        <Input value={values.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. Sharma Tiffin Service" />
      </div>

      <div className="space-y-1.5">
        <Label>Type *</Label>
        <Combobox
          placeholder="Choose type..."
          value={values.type}
          onChange={(v: string) => onChange({ type: v })}
          options={VENDOR_TYPES.map((t) => ({ value: t, label: VENDOR_TYPE_LABELS[t] }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Phone *</Label>
          <Input value={values.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="10-digit number" />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp (optional)</Label>
          <Input value={values.whatsapp} onChange={(e) => onChange({ whatsapp: e.target.value })} placeholder="If different" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Area / Locality</Label>
          <Input value={values.area} onChange={(e) => onChange({ area: e.target.value })} placeholder="e.g. Near Gate 2" />
        </div>
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input value={values.address} onChange={(e) => onChange({ address: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Opens at</Label>
          <Input type="time" value={values.openTime} onChange={(e) => onChange({ openTime: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Closes at</Label>
          <Input type="time" value={values.closeTime} onChange={(e) => onChange({ closeTime: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={2} value={values.description} onChange={(e) => onChange({ description: e.target.value })} />
      </div>

      {showMonthly && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Monthly price (₹)</Label>
              <Input type="number" value={values.monthlyPrice} onChange={(e) => onChange({ monthlyPrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Trial meal price (₹)</Label>
              <Input type="number" value={values.trialMealPrice} onChange={(e) => onChange({ trialMealPrice: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Weekly menu</Label>
            <Textarea
              rows={5}
              value={values.weeklyMenu}
              onChange={(e) => onChange({ weeklyMenu: e.target.value })}
              placeholder={"Mon: Dal, Rice, Roti, Sabzi\nTue: Rajma, Rice, Roti\n..."}
            />
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.isVegOnly} onChange={(e) => onChange({ isVegOnly: e.target.checked })} />
          Pure Veg
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={values.hasDelivery} onChange={(e) => onChange({ hasDelivery: e.target.checked })} />
          Home delivery available
        </label>
      </div>

      {values.hasDelivery && (
        <div className="space-y-1.5">
          <Label>Delivery note</Label>
          <Input
            value={values.deliveryNote}
            onChange={(e) => onChange({ deliveryNote: e.target.value })}
            placeholder="e.g. Free within 2 km, ₹20 beyond"
          />
        </div>
      )}
    </div>
  )
}