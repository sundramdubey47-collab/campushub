"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Stats = {
  totalUniversities: number
  totalColleges: number
  totalUsers: number
  totalPremiumUsers: number
  totalNotes: number
  totalEvents: number
  totalListings: number
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/super-admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setStats(data)
      })
  }, [])

  if (error) return <p className="text-red-500">{error}</p>
  if (!stats) return <p className="text-muted-foreground">Load ho raha hai...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/super-admin/universities" className="text-sm text-primary underline">
            Universities →
          </Link>
          <Link href="/super-admin/colleges" className="text-sm text-primary underline">
            Colleges →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalUniversities}</p>
          <p className="text-xs text-muted-foreground">Universities</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalColleges}</p>
          <p className="text-xs text-muted-foreground">Colleges</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalPremiumUsers}</p>
          <p className="text-xs text-muted-foreground">Premium Users</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalNotes}</p>
          <p className="text-xs text-muted-foreground">Resources</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalEvents}</p>
          <p className="text-xs text-muted-foreground">Events</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalListings}</p>
          <p className="text-xs text-muted-foreground">Marketplace Items</p>
        </div>
      </div>
    </div>
  )
}