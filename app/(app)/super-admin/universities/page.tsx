"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/empty-state"
import { Building2, Plus } from "lucide-react"

type University = {
  id: number
  name: string
  code: string
  city: string | null
  state: string | null
  _count: { colleges: number }
}

export default function SuperAdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function loadUniversities() {
    const res = await fetch("/api/super-admin/universities")
    setUniversities(await res.json())
  }

  useEffect(() => {
    loadUniversities()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name || !code) {
      setError("Name and Code are required")
      return
    }

    setLoading(true)
    const res = await fetch("/api/super-admin/universities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code, city, state }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setName(""); setCode(""); setCity(""); setState("")
    loadUniversities()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Universities" description="Onboard new universities onto CampusHub" />

      <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-3">
        {error && <p className="text-sm text-red-500">{error}</p>}
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
          <div className="space-y-1.5">
            <Label>State</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          <Plus className="h-4 w-4 mr-1.5" /> {loading ? "Adding..." : "Add University"}
        </Button>
      </form>

      {universities.length === 0 ? (
        <EmptyState icon={Building2} title="No universities added yet" />
      ) : (
        <div className="space-y-2">
          {universities.map((u) => (
            <div key={u.id} className="rounded-xl border bg-card p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{u.name} <span className="text-muted-foreground font-normal">({u.code})</span></p>
                <p className="text-xs text-muted-foreground">{u.city}, {u.state}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{u._count.colleges} colleges</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}