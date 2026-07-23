"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, IndianRupee, CheckCircle2, Download, UserPlus } from "lucide-react"

type Registration = {
  id: number
  registeredAt: string
  attended: boolean
  user: { name: string; email: string; phone: string | null }
}

export default function EventManagePage() {
  const params = useParams()
  const eventId = params.id

  const [data, setData] = useState<{ registrations: Registration[]; stats: any; event: any } | null>(null)
  const [team, setTeam] = useState<{ user: { name: string; email: string }; role: string }[]>([])
  const [volunteerEmail, setVolunteerEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function load() {
    const res = await fetch(`/api/events/${eventId}/registrations`)
    if (res.ok) setData(await res.json())
    else {
      const d = await res.json()
      setError(d.error)
    }

    const teamRes = await fetch(`/api/events/${eventId}/team`)
    if (teamRes.ok) setTeam(await teamRes.json())
  }

  useEffect(() => {
    load()
  }, [eventId])

  async function addVolunteer() {
    setMessage("")
    const res = await fetch(`/api/events/${eventId}/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: volunteerEmail }),
    })
    const d = await res.json()
    if (!res.ok) {
      setMessage("❌ " + d.error)
      return
    }
    setMessage("✅ Volunteer added")
    setVolunteerEmail("")
    load()
  }

  function downloadCSV() {
    if (!data) return
    const rows = [
      ["Name", "Email", "Phone", "Registered At", "Checked In"],
      ...data.registrations.map((r) => [
        r.user.name, r.user.email, r.user.phone || "", new Date(r.registeredAt).toLocaleString(), r.attended ? "Yes" : "No",
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.event.title}-registrations.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (error) return <p className="text-red-500 text-sm">{error}</p>
  if (!data) return <p className="text-muted-foreground text-sm">Loading...</p>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{data.event.title} — Manage</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <Users className="h-4 w-4 mx-auto text-primary" />
          <p className="text-xl font-bold">{data.stats.totalRegistered}</p>
          <p className="text-[10px] text-muted-foreground">Registered</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center space-y-1">
          <CheckCircle2 className="h-4 w-4 mx-auto text-[oklch(var(--success))]" />
          <p className="text-xl font-bold">{data.stats.totalCheckedIn}</p>
          <p className="text-[10px] text-muted-foreground">Checked In</p>
        </div>
        {data.event.isPaid && (
          <div className="rounded-xl border bg-card p-4 text-center space-y-1">
            <IndianRupee className="h-4 w-4 mx-auto text-[oklch(var(--premium))]" />
            <p className="text-xl font-bold">₹{data.stats.estimatedRevenue}</p>
            <p className="text-[10px] text-muted-foreground">Est. Revenue</p>
          </div>
        )}
      </div>

      <Button size="sm" variant="outline" onClick={downloadCSV}>
        <Download className="h-4 w-4 mr-1.5" /> Download CSV
      </Button>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm flex items-center gap-2"><UserPlus className="h-4 w-4" /> Add Volunteer (for QR scanning)</h2>
        {message && <p className="text-xs">{message}</p>}
        <div className="flex gap-2">
          <Input placeholder="Volunteer's email" value={volunteerEmail} onChange={(e) => setVolunteerEmail(e.target.value)} />
          <Button size="sm" onClick={addVolunteer}>Add</Button>
        </div>
        <div className="space-y-1">
          {team.map((t, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span>{t.user.name} ({t.user.email})</span>
              <span className="bg-muted px-2 py-0.5 rounded-full">{t.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-sm">Registered Students</h2>
        {data.registrations.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-3 flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{r.user.name}</p>
              <p className="text-xs text-muted-foreground">{r.user.email}{r.user.phone && ` • ${r.user.phone}`}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.attended ? "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]" : "bg-muted text-muted-foreground"}`}>
              {r.attended ? "Checked In" : "Not Yet"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}