"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DietMark } from "@/components/diet-mark"
import {
  VendorFormFields,
  vendorValuesToPayload,
  type VendorFormValues,
} from "@/components/vendor-form-fields"
import { DIETS, DIET_LABELS } from "@/lib/food-shared"
import { Trash2, Pencil, Check, X, Flame, MessageCircle, ClipboardList } from "lucide-react"

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

type VendorData = {
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
  isActive: boolean
  isOpenNow: boolean
  menuItems: Item[]
  manager: { name: string; email: string } | null
}

function toFormValues(v: VendorData): VendorFormValues {
  return {
    name: v.name,
    type: v.type,
    description: v.description ?? "",
    area: v.area ?? "",
    address: v.address ?? "",
    phone: v.phone,
    whatsapp: v.whatsapp ?? "",
    openTime: v.openTime ?? "",
    closeTime: v.closeTime ?? "",
    isVegOnly: v.isVegOnly,
    hasDelivery: v.hasDelivery,
    deliveryNote: v.deliveryNote ?? "",
    monthlyPrice: v.monthlyPrice?.toString() ?? "",
    trialMealPrice: v.trialMealPrice?.toString() ?? "",
    weeklyMenu: v.weeklyMenu ?? "",
  }
}

const selectClass = "h-9 rounded-md border bg-background px-2 text-sm"

export default function VendorManagePage() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [stats, setStats] = useState({ orderClicks: 0, trialRequests: 0 })
  const [isAdmin, setIsAdmin] = useState(false)
  const [values, setValues] = useState<VendorFormValues | null>(null)
  const [loadError, setLoadError] = useState("")
  const [notice, setNotice] = useState("")

  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newDiet, setNewDiet] = useState("VEG")
  const [newCategory, setNewCategory] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newSpecial, setNewSpecial] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCategory, setEditCategory] = useState("")

  const [managerEmail, setManagerEmail] = useState("")

  const load = useCallback(async () => {
    const res = await fetch(`/api/food/vendors/${vendorId}`)
    const data = await res.json()
    if (!res.ok) {
      setLoadError(data.error || "Could not load this vendor")
      return
    }
    setVendor(data.vendor)
    setStats(data.stats)
    setIsAdmin(data.isAdmin)
    setValues(toFormValues(data.vendor))
  }, [vendorId])

  useEffect(() => {
    load()
  }, [load])

  async function patchVendor(body: Record<string, unknown>, successMessage?: string) {
    setNotice("")
    const res = await fetch(`/api/food/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      setNotice("❌ " + data.error)
      return
    }
    if (successMessage) setNotice("✅ " + successMessage)
    load()
  }

  async function addItem() {
    setNotice("")
    if (!newName.trim() || !newPrice) {
      setNotice("❌ Dish name and price are required")
      return
    }
    const res = await fetch(`/api/food/vendors/${vendorId}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        price: newPrice,
        diet: newDiet,
        category: newCategory.trim() || null,
        description: newDescription.trim() || null,
        isSpecial: newSpecial,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setNotice("❌ " + data.error)
      return
    }
    setNewName("")
    setNewPrice("")
    setNewDescription("")
    setNewSpecial(false)
    load()
  }

  async function patchItem(id: number, body: Record<string, unknown>) {
    const res = await fetch(`/api/food/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) {
      setNotice("❌ " + data.error)
      return false
    }
    load()
    return true
  }

  async function saveEdit(id: number) {
    const ok = await patchItem(id, { name: editName, price: editPrice, category: editCategory.trim() || null })
    if (ok) setEditingId(null)
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this dish?")) return
    await fetch(`/api/food/menu/${id}`, { method: "DELETE" })
    load()
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return
    setNotice("")
    const fd = new FormData()
    fd.append("image", file)
    const res = await fetch(`/api/food/vendors/${vendorId}/image`, { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok) {
      setNotice("❌ " + data.error)
      return
    }
    setNotice("✅ Photo updated")
    load()
  }

  async function assignManager(email: string) {
    setNotice("")
    const res = await fetch(`/api/food/vendors/${vendorId}/manager`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) {
      setNotice("❌ " + data.error)
      return
    }
    setNotice(email ? "✅ Manager assigned" : "✅ Manager removed")
    setManagerEmail("")
    load()
  }

  async function deleteVendor() {
    if (!confirm("Delete this vendor and its whole menu permanently?")) return
    const res = await fetch(`/api/food/vendors/${vendorId}`, { method: "DELETE" })
    if (res.ok) router.push("/food/manage")
  }

  if (loadError) return <p className="text-sm text-red-500">{loadError}</p>
  if (!vendor || !values) return <p className="text-sm text-muted-foreground">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">{vendor.name}</h1>
        <Link href={`/food/${vendor.id}`} className="text-xs text-primary underline underline-offset-2">
          View public page
        </Link>
      </div>

      {notice && <p className="text-sm font-medium rounded-lg border p-3">{notice}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center">
          <MessageCircle className="h-4 w-4 mx-auto text-primary" />
          <p className="text-xl font-bold mt-1">{stats.orderClicks}</p>
          <p className="text-[10px] text-muted-foreground">WhatsApp order taps</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <ClipboardList className="h-4 w-4 mx-auto text-primary" />
          <p className="text-xl font-bold mt-1">{stats.trialRequests}</p>
          <p className="text-[10px] text-muted-foreground">Trial requests</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Status</h2>
        <label className="flex items-center justify-between text-sm">
          <span>Open right now (turn off to show as Closed)</span>
          <input
            type="checkbox"
            checked={vendor.isOpenNow}
            onChange={(e) => patchVendor({ isOpenNow: e.target.checked })}
          />
        </label>
        {isAdmin && (
          <label className="flex items-center justify-between text-sm">
            <span>Visible to students</span>
            <input type="checkbox" checked={vendor.isActive} onChange={(e) => patchVendor({ isActive: e.target.checked })} />
          </label>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Menu ({vendor.menuItems.length})</h2>

        <div className="rounded-xl bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-medium">Add a dish</p>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Dish name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input type="number" placeholder="Price (₹)" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <select className={selectClass} value={newDiet} onChange={(e) => setNewDiet(e.target.value)}>
              {DIETS.map((d) => (
                <option key={d} value={d}>{DIET_LABELS[d]}</option>
              ))}
            </select>
            <Input placeholder="Category (e.g. Pizza)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
          </div>
          <Input placeholder="Short description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={newSpecial} onChange={(e) => setNewSpecial(e.target.checked)} />
              Today's special
            </label>
            <Button size="sm" onClick={addItem}>Add</Button>
          </div>
        </div>

        <div className="space-y-1">
          {vendor.menuItems.length === 0 && <p className="text-sm text-muted-foreground py-3 text-center">No dishes yet</p>}

          {vendor.menuItems.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="border-t pt-2 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(item.id)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div key={item.id} className="flex items-center gap-2 border-t py-2">
                <DietMark diet={item.diet} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${item.isAvailable ? "" : "line-through opacity-60"}`}>{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    ₹{item.price}
                    {item.category ? ` • ${item.category}` : ""}
                  </p>
                </div>
                <label className="flex items-center gap-1 text-[11px]" title="Available today">
                  <input type="checkbox" checked={item.isAvailable} onChange={(e) => patchItem(item.id, { isAvailable: e.target.checked })} />
                  Avail
                </label>
                <button
                  onClick={() => patchItem(item.id, { isSpecial: !item.isSpecial })}
                  title="Today's special"
                  className={`p-1.5 rounded ${item.isSpecial ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                >
                  <Flame className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingId(item.id)
                    setEditName(item.name)
                    setEditPrice(String(item.price))
                    setEditCategory(item.category ?? "")
                  }}
                  className="p-1.5 text-muted-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-1.5 text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm">Vendor details</h2>
        <VendorFormFields values={values} onChange={(patch) => setValues((prev) => (prev ? { ...prev, ...patch } : prev))} />
        <Button size="sm" onClick={() => patchVendor(vendorValuesToPayload(values), "Details saved")}>
          Save Details
        </Button>
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-2">
        <h2 className="font-semibold text-sm">Photo</h2>
        {vendor.imageUrl && <img src={vendor.imageUrl} alt="" className="h-32 w-full object-cover rounded-lg" />}
        <Input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} />
      </div>

      {isAdmin && (
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold text-sm">Manager</h2>
          <p className="text-xs text-muted-foreground">
            A manager can edit the menu and availability. {vendor.manager ? `Current: ${vendor.manager.name} (${vendor.manager.email})` : "No manager assigned."}
          </p>
          <div className="space-y-1.5">
            <Label>Manager's email (must be a registered student of this college)</Label>
            <Input value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => assignManager(managerEmail)} disabled={!managerEmail.trim()}>
              Assign
            </Button>
            {vendor.manager && (
              <Button size="sm" variant="outline" onClick={() => assignManager("")}>
                Remove Manager
              </Button>
            )}
          </div>
        </div>
      )}

      {isAdmin && (
        <Button variant="outline" className="w-full text-red-500 border-red-300" onClick={deleteVendor}>
          Delete this vendor
        </Button>
      )}
    </div>
  )
}