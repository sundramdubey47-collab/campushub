"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Stats = {
  totalStudents: number
  totalFaculty: number
  totalNotes: number
  totalEvents: number
  totalListings: number
  totalNotices: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/stats")
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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/users" className="text-sm text-primary underline">
          Users Manage Karo →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          <p className="text-xs text-muted-foreground">Students</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalFaculty}</p>
          <p className="text-xs text-muted-foreground">Faculty</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalNotes}</p>
          <p className="text-xs text-muted-foreground">Resources Uploaded</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalEvents}</p>
          <p className="text-xs text-muted-foreground">Events</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalListings}</p>
          <p className="text-xs text-muted-foreground">Marketplace Listings</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-3xl font-bold">{stats.totalNotices}</p>
          <p className="text-xs text-muted-foreground">Notices Posted</p>
        </div>
      </div>
    </div>
  )
}