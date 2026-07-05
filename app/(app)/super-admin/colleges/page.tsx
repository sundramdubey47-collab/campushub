"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/autocomplete"

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
      setError("Sab fields zaroori hain")
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

    setName("")
    setCode("")
    setCity("")
    setUniversityId("")
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

    setAssignMessage({ ...assignMessage, [collegeId]: res.ok ? "✅ Admin assign ho gaya" : "❌ " + data.error })

    if (res.ok) loadData()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Colleges</h1>

      <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-1">
          <Label>University</Label>
          <Autocomplete
            placeholder="University chuno..."
            value={universityId}
            onChange={setUniversityId}
            options={universities.map((u) => ({ value: u.id.toString(), label: u.name }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Ban raha hai..." : "College Banao"}
        </Button>
      </form>

      <div className="space-y-3">
        {colleges.map((c) => (
          <div key={c.id} className="border rounded-lg p-4 space-y-2">
            <div>
              <p className="font-medium">{c.name} ({c.code})</p>
              <p className="text-xs text-muted-foreground">{c.university.name} — {c.city}</p>
            </div>

            {c.admin ? (
              <p className="text-sm text-green-600">Admin: {c.admin.name} ({c.admin.email})</p>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="User ka email (jo pehle se is college me hai)"
                  value={assignEmail[c.id] || ""}
                  onChange={(e) => setAssignEmail({ ...assignEmail, [c.id]: e.target.value })}
                />
                <Button size="sm" onClick={() => handleAssignAdmin(c.id)}>
                  Admin Banao
                </Button>
              </div>
            )}
            {assignMessage[c.id] && <p className="text-xs">{assignMessage[c.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}