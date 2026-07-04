"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { QrCode } from "lucide-react"

type Event = {
  id: number
  title: string
  description: string | null
  type: string
  venue: string | null
  eventDate: string
  registrationDeadline: string | null
  seatLimit: number | null
  createdBy: { name: string }
  _count: { registrations: number }
}

function Countdown({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    function update() {
      const diff = new Date(eventDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft("Shuru ho chuka hai")
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      setTimeLeft(`${days}d ${hours}h ${minutes}m baaki`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [eventDate])

  return <p className="text-sm text-primary font-medium">{timeLeft}</p>
}

function EventCard({ event, canManage }: { event: Event; canManage: boolean }) {
  const [registered, setRegistered] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/events/${event.id}/register`)
      .then((r) => r.json())
      .then((d) => {
        setRegistered(d.registered)
        if (d.qrImage) setQrImage(d.qrImage)
      })
  }, [event.id])

  async function handleRegister() {
    setLoading(true)
    setError("")

    const res = await fetch(`/api/events/${event.id}/register`, { method: "POST" })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setRegistered(true)
    setQrImage(data.qrImage)
  }

  const seatsLeft = event.seatLimit ? event.seatLimit - event._count.registrations : null

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <h2 className="font-semibold">{event.title}</h2>
        <span className="text-xs bg-muted px-2 py-1 rounded">{event.type}</span>
      </div>

      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
      {event.venue && <p className="text-sm text-muted-foreground">Venue: {event.venue}</p>}

      <Countdown eventDate={event.eventDate} />

      <p className="text-xs text-muted-foreground">
        {seatsLeft !== null ? `${seatsLeft} seats left` : "Unlimited seats"}
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {registered && qrImage ? (
        <div className="space-y-1">
          <p className="text-sm text-green-600">Aap register ho chuke hain ✅</p>
          <img src={qrImage} alt="QR Code" className="w-32 h-32" />
        </div>
      ) : (
        <Button onClick={handleRegister} disabled={loading || seatsLeft === 0}>
          {loading ? "Register ho raha hai..." : seatsLeft === 0 ? "Seats full" : "Register Karo"}
        </Button>
      )}

      {canManage && (
        <Link href={`/events/${event.id}/scan`}>
          <Button variant="outline" className="w-full mt-2">
            <QrCode className="h-4 w-4 mr-2" />
            Attendance Scan Karo
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function EventsPage() {
  const { data: session } = useSession()
  const canCreate = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role)

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        {canCreate && (
          <Link href="/events/create">
            <Button>Event Banao</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Load ho raha hai...</p>
      ) : events.length === 0 ? (
        <p className="text-muted-foreground">Koi event nahi hai</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} canManage={canCreate} />
          ))}
        </div>
      )}
    </div>
  )
}