"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { HelpCircle, Plus, CheckCircle2 } from "lucide-react"

type Request = {
  id: number
  title: string
  description: string | null
  status: string
  createdAt: string
  requestedBy: { name: string }
  fulfilledNote: { id: number; title: string } | null
}

export default function ResourceRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/resource-requests")
    const data = await res.json()
    setRequests(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Please describe what you're looking for")
      return
    }

    setSubmitting(true)
    const res = await fetch("/api/resource-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setTitle("")
    setDescription("")
    setShowForm(false)
    load()
  }

  const openRequests = requests.filter((r) => r.status === "OPEN")
  const fulfilledRequests = requests.filter((r) => r.status === "FULFILLED")

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Request a Resource"
        description="Can't find what you need? Ask your campus community — someone might already have it"
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1.5" /> New Request
          </Button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Input
            placeholder="What are you looking for? e.g. 'Data Structures Unit 3 notes'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Any extra details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Posting..." : "Post Request"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <>
          <div className="space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" /> Open Requests
            </h2>
            {openRequests.length === 0 ? (
              <EmptyState icon={HelpCircle} title="No open requests" description="Everyone's found what they need — for now!" />
            ) : (
              <div className="space-y-2">
                {openRequests.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-card p-4 space-y-1">
                    <p className="font-semibold text-sm">{r.title}</p>
                    {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                    <p className="text-[11px] text-muted-foreground pt-1 border-t">
                      Requested by {r.requestedBy.name} • {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    <Link href="/notes/upload">
                      <Button size="sm" variant="outline" className="mt-1">Have this? Upload it</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {fulfilledRequests.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[oklch(var(--success))]" /> Recently Fulfilled
              </h2>
              <div className="space-y-2">
                {fulfilledRequests.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-muted/30 p-4 space-y-1">
                    <p className="font-medium text-sm text-muted-foreground line-through">{r.title}</p>
                    {r.fulfilledNote && (
                      <Link href={`/notes/${r.fulfilledNote.id}`} className="text-xs text-primary underline">
                        View uploaded resource →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}