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
  { value: "CYCLE", label: "Cycle" },
  { value: "CALCULATOR", label: "Calculator" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "HOSTEL_ITEMS", label: "Hostel Items" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "OTHER", label: "Other" },
]

const TYPE_OPTIONS = [
  { value: "SELL", label: "Sell" },
  { value: "EXCHANGE", label: "Exchange" },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("SELL")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
const [cropModalOpen, setCropModalOpen] = useState(false)
const [pendingFile, setPendingFile] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title || !category) {
      setError("Title and Category are need ")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("type", type)
    formData.append("price", price)
    formData.append("location", location)
   files.forEach((f) => formData.append("files", f))

    const res = await fetch("/api/listings", { method: "POST", body: formData })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/marketplace")
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold"> list your Item  </h1>

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
          <Label>Type</Label>
          <Combobox placeholder="Type..." value={type} onChange={setType} options={TYPE_OPTIONS} />
        </div>

        {type === "SELL" && (
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <Label>Location (Hostel/Area)</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

       <div className="space-y-2">
  <Label>Photos (up to 5)</Label>
  <Input
    type="file"
    accept="image/*"
    multiple
   onChange={(e) => {
  const f = e.target.files?.[0]
  if (f) {
    setPendingFile(f)
    setCropModalOpen(true)
  }
}}
  />
  {files.length > 0 && (
    <p className="text-xs text-muted-foreground">{files.length} photo(s) selected</p>
  )}
</div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Posting..." : "List item"}
        </Button>
        <ImageCropModal
  file={pendingFile}
  open={cropModalOpen}
  onClose={() => setCropModalOpen(false)}
  onCropped={(cropped) => setFiles((prev) => [cropped, ...prev.slice(1)])}
/>
      </form>
    </div>
  )
}