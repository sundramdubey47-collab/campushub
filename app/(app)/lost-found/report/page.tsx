"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"

const TYPE_OPTIONS = [
  { value: "LOST", label: "Maine Kuch Khoya Hai" },
  { value: "FOUND", label: "Maine Kuch Paaya Hai" },
]

export default function ReportLostFoundPage() {
  const router = useRouter()
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [reward, setReward] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!type || !title) {
      setError("Type aur Title zaroori hai")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("type", type)
    formData.append("title", title)
    formData.append("description", description)
    formData.append("location", location)
    formData.append("contactNumber", contactNumber)
    formData.append("reward", reward)
    if (file) formData.append("file", file)

    const res = await fetch("/api/lost-found", { method: "POST", body: formData })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/lost-found")
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Lost/Found Report Karo</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          <Label>Type</Label>
          <Combobox placeholder="Type chuno..." value={type} onChange={setType} options={TYPE_OPTIONS} />
        </div>

        <div className="space-y-2">
          <Label>Item ka Naam</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Jaise: Library, 2nd floor" />
        </div>

        <div className="space-y-2">
          <Label>Contact Number</Label>
          <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
        </div>

        {type === "LOST" && (
          <div className="space-y-2">
            <Label>Reward (optional)</Label>
            <Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Jaise: ₹100" />
          </div>
        )}

        <div className="space-y-2">
          <Label>Photo</Label>
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Post ho raha hai..." : "Report Karo"}
        </Button>
      </form>
    </div>
  )
}