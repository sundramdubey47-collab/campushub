"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, GraduationCap, FileText, Calendar, ShoppingBag, Bell, ArrowRight } from "lucide-react"

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

  if (error) return <p className="text-red-500 text-sm">{error}</p>

  if (!stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="An overview of everything happening at your college"
        action={
          <Link href="/admin/users" className="text-sm text-primary font-medium underline underline-offset-2 flex items-center gap-1">
            Manage Users <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <StatCard label="Students" value={stats.totalStudents} icon={Users} />
        <StatCard label="Faculty" value={stats.totalFaculty} icon={GraduationCap} />
        <StatCard label="Resources Uploaded" value={stats.totalNotes} icon={FileText} />
        <StatCard label="Events" value={stats.totalEvents} icon={Calendar} />
        <StatCard label="Marketplace Listings" value={stats.totalListings} icon={ShoppingBag} />
        <StatCard label="Notices Posted" value={stats.totalNotices} icon={Bell} />
      </motion.div>
    </div>
  )
}