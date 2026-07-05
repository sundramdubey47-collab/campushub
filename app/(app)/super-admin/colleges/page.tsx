"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/autocomplete"
import { EmptyState } from "@/components/empty-state"
import { School, Plus, ShieldCheck } from "lucide-react"

type University = { id: number; name: string }
type College = {
  id: number
  name: string
  code: string
  city: string | null
  university: { name: string }
  admin: { name: string; email: string } | null
}

export default function SuperAdminCollegesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [colleges, setColleges] = useState<College[]>([])

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [city, setCity] = useState("")
  const [universityId, setUniversityId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [assignEmail, setAssignEmail] = useState<{ [key: number]: string }>({})
  const [assignMessage, setAssignMessage] = useState<{ [key: number]: string }>({})

  async function loadData() {
    const [uRes, cRes] = await Promise.all([
      fetch("/api/super-admin/universities"),
      fetch("/api/super-admin/colleges"),
    ])
    setUniversities(await uRes.json())
    setColleges(await cRes.json())
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name || !code || !universityId) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    const res = await fetch("/api/super-admin/colleges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, city, universityId }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setName(""); setCode(""); setCity(""); setUniversityId("")
    loadData()
  }

  async function handleAssignAdmin(collegeId: number) {
    const email = assignEmail[collegeId]
    if (!email) return

    const res = await fetch(`/api/super-admin/colleges/${collegeId}/assign-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: email }),
    })
    const data = await res.json()

    setAssignMessage({ ...assignMessage, [collegeId]: res.ok ? "✅ Admin assigned successfully" : "❌ " + data.error })
    if (res.ok) loadData()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Colleges" description="Add colleges and assign administrators" />

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-3">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-1.5">
          <Label>University</Label>
          <Autocomplete
            placeholder="Select university..."
            value={universityId}
            onChange={setUniversityId}
            options={universities.map((u) => ({ value: u.id.toString(), label: u.name }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          <Plus className="h-4 w-4 mr-1.5" /> {loading ? "Adding..." : "Add College"}
        </Button>
      </form>

      {colleges.length === 0 ? (
        <EmptyState icon={School} title="No colleges added yet" />
      ) : (
        <div className="space-y-3">
          {colleges.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-4 space-y-2">
              <div>
                <p className="font-medium text-sm">{c.name} <span className="text-muted-foreground font-normal">({c.code})</span></p>
                <p className="text-xs text-muted-foreground">{c.university.name} — {c.city}</p>
              </div>

              {c.admin ? (
                <p className="text-xs text-[oklch(var(--success))] flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin: {c.admin.name} ({c.admin.email})
                </p>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Email of existing member to promote"
                    value={assignEmail[c.id] || ""}
                    onChange={(e) => setAssignEmail({ ...assignEmail, [c.id]: e.target.value })}
                  />
                  <Button size="sm" onClick={() => handleAssignAdmin(c.id)}>
                    Assign Admin
                  </Button>
                </div>
              )}
              {assignMessage[c.id] && <p className="text-xs">{assignMessage[c.id]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}