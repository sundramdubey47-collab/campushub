"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"
import { ImageCropModal } from "@/components/image-crop-modal"

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

const PRICING_OPTIONS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
]

export default function CreateRentalPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [pricingType, setPricingType] = useState("DAILY")
  const [price, setPrice] = useState("")
  const [securityDeposit, setSecurityDeposit] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
const [cropModalOpen, setCropModalOpen] = useState(false)
const [pendingFile, setPendingFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title || !category || !price) {
      setError("Title, Category aur Price zaroori hai")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("pricingType", pricingType)
    formData.append("price", price)
    formData.append("securityDeposit", securityDeposit)
    if (file) formData.append("file", file)

    const res = await fetch("/api/rentals", { method: "POST", body: formData })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/rentals")
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold"> Rent your Items</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Combobox placeholder="Category..." value={category} onChange={setCategory} options={CATEGORY_OPTIONS} />
        </div>

        <div className="space-y-2">
          <Label>Pricing Type</Label>
          <Combobox placeholder="Pricing..." value={pricingType} onChange={setPricingType} options={PRICING_OPTIONS} />
        </div>

        <div className="space-y-2">
          <Label>Price (₹)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Security Deposit (₹, optional)</Label>
          <Input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Photo</Label>
<Input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const f = e.target.files?.[0]
    if (f) {
      setPendingFile(f)
      setCropModalOpen(true)
    }
  }}
/>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Posting..." : "List"}
        </Button>
        <ImageCropModal
  file={pendingFile}
  open={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  onCropped={(cropped) => setFile(cropped)}
/>
      </form>
    </div>
  )
}