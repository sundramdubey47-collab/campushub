"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import {
  VendorFormFields,
  emptyVendorValues,
  vendorValuesToFormData,
  type VendorFormValues,
} from "@/components/vendor-form-fields"
import { VENDOR_TYPE_LABELS } from "@/lib/food-shared"
import { Plus, Store } from "lucide-react"

type ManagedVendor = {
  id: number
  name: string
  type: string
  isActive: boolean
  isOpenNow: boolean
  manager: { name: string; email: string } | null
  _count: { menuItems: number; enquiries: number }
}

export default function FoodManagePage() {
  const [vendors, setVendors] = useState<ManagedVendor[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [values, setValues] = useState<VendorFormValues>(emptyVendorValues)
  const [image, setImage] = useState<File | null>(null)
  const [notify, setNotify] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch("/api/food/vendors")
    const data = await res.json()
    setVendors(data.vendors ?? [])
    setIsAdmin(!!data.isAdmin)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!values.name.trim() || !values.phone.trim()) {
      setError("Name and phone are required")
      return
    }

    setSaving(true)
    const res = await fetch("/api/food/vendors", {
      method: "POST",
      body: vendorValuesToFormData(values, image, notify),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setValues(emptyVendorValues)
    setImage(null)
    setNotify(false)
    setShowForm(false)
    load()
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="Manage Food & Mess"
        description={isAdmin ? "Add vendors and manage their menus" : "Menus you manage"}
        action={
          isAdmin ? (
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Vendor
            </Button>
          ) : undefined
        }
      />

      {isAdmin && showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border bg-card p-5 space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}

          <VendorFormFields values={values} onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))} />

          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Notify all students about this new place
          </label>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Saving..." : "Add Vendor"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Nothing to manage yet"
          description={isAdmin ? "Add your first vendor to get started" : "An admin can make you a manager of a food place"}
        />
      ) : (
        <div className="space-y-2">
          {vendors.map((v) => (
            <div key={v.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {v.name}
                  {!v.isActive && <span className="ml-2 text-[10px] bg-muted px-2 py-0.5 rounded-full">Hidden</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {VENDOR_TYPE_LABELS[v.type]} • {v._count.menuItems} items • {v._count.enquiries} student taps
                  {v.manager ? ` • Manager: ${v.manager.name}` : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/food/${v.id}`}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
                <Link href={`/food/${v.id}/manage`}>
                  <Button size="sm" variant="outline">Manage</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}