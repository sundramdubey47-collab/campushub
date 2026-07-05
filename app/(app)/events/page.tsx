"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { QrCode, Calendar, Plus, MapPin, Clock, Users } from "lucide-react"

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

const TYPE_STYLES: Record<string, string> = {
  FEST: "bg-[oklch(0.72_0.15_60/0.15)] text-[oklch(0.5_0.15_60)]",
  HACKATHON: "bg-[oklch(0.55_0.15_278/0.15)] text-[oklch(0.4_0.15_278)]",
  SEMINAR: "bg-[oklch(0.55_0.13_145/0.15)] text-[oklch(0.4_0.13_145)]",
  SPORTS: "bg-[oklch(0.6_0.18_25/0.15)] text-[oklch(0.45_0.18_25)]",
  WORKSHOP: "bg-[oklch(0.55_0.15_278/0.15)] text-[oklch(0.4_0.15_278)]",
  COMPETITION: "bg-[oklch(0.6_0.18_25/0.15)] text-[oklch(0.45_0.18_25)]",
  OTHER: "bg-muted text-muted-foreground",
}

function Countdown({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    function update() {
      const diff = new Date(eventDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft("Live / Ho chuka hai")
        setIsLive(true)
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      setTimeLeft(days > 0 ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [eventDate])

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isLive ? "text-[oklch(var(--success))]" : "text-primary"}`}>
      <Clock className="h-3.5 w-3.5" />
      {timeLeft}
    </div>
  )
}

function EventCard({ event, canManage, index }: { event: Event; canManage: boolean; index: number }) {
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
  const seatsFull = seatsLeft === 0
  const dateObj = new Date(event.eventDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

      <div className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 items-start">
            {/* Date block */}
            <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/50 px-3 py-1.5 shrink-0 min-w-[52px]">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {dateObj.toLocaleDateString("en-US", { month: "short" })}
              </span>
              <span className="text-lg font-bold leading-none">{dateObj.getDate()}</span>
            </div>
            <div>
              <h2 className="font-semibold leading-snug">{event.title}</h2>
              <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[event.type] || TYPE_STYLES.OTHER}`}>
                {event.type}
              </span>
            </div>
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          {event.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {event.venue}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {seatsLeft !== null ? `${seatsLeft} seats left` : "Unlimited seats"}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Countdown eventDate={event.eventDate} />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="pt-1 space-y-2">
          {registered && qrImage ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <img src={qrImage} alt="QR Code" className="w-14 h-14 rounded-lg border bg-white shrink-0" />
              <p className="text-xs text-[oklch(var(--success))] font-medium">You're in! ✅<br/><span className="text-muted-foreground font-normal">Show this QR code at entry</span></p>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={handleRegister}
              disabled={loading || seatsFull}
            >
             {loading ? "Registering..." : seatsFull ? "Seats Full" : "Register Now"}
            </Button>
          )}

          {canManage && (
            <Link href={`/events/${event.id}/scan`}>
              <Button variant="outline" size="sm" className="w-full">
                <QrCode className="h-3.5 w-3.5 mr-1.5" /> Scan Attendance
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
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
    <div className="space-y-5">
     <PageHeader
  title="Events"
  description="Fests, hackathons, workshops & more — never miss what's happening on campus"
  action={
    canCreate && (
      <Link href="/events/create">
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Event</Button>
      </Link>
    )
  }
/>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
  icon={Calendar}
  title="No events yet"
  description="Exciting things are coming — check back soon or be the first to create one"
/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} canManage={canCreate} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}