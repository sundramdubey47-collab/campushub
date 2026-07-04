"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/combobox"

const TYPE_OPTIONS = [
  { value: "FEST", label: "Fest" },
  { value: "HACKATHON", label: "Hackathon" },
  { value: "SEMINAR", label: "Seminar" },
  { value: "SPORTS", label: "Sports" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "COMPETITION", label: "Competition" },
  { value: "OTHER", label: "Other" },
]

export default function CreateEventPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [venue, setVenue] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [registrationDeadline, setRegistrationDeadline] = useState("")
  const [seatLimit, setSeatLimit] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title || !eventDate) {
      setError("Title aur Event Date zaroori hai")
      return
    }

    setLoading(true)

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        type,
        venue,
        eventDate,
        registrationDeadline: registrationDeadline || null,
        seatLimit: seatLimit || null,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    router.push("/events")
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Event Banao</h1>

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
          <Label>Event Type</Label>
          <Combobox
            placeholder="Type chuno..."
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
          />
        </div>

        <div className="space-y-2">
          <Label>Venue</Label>
          <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Event Date & Time</Label>
          <Input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Registration Deadline (optional)</Label>
          <Input
            type="datetime-local"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Seat Limit (optional)</Label>
          <Input type="number" value={seatLimit} onChange={(e) => setSeatLimit(e.target.value)} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ban raha hai..." : "Event Banao"}
        </Button>
      </form>
    </div>
  )
}