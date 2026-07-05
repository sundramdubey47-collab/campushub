"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, School, Users, Crown, FileText, Calendar, ShoppingBag, ArrowRight } from "lucide-react"

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

  if (error) return <p className="text-red-500 text-sm">{error}</p>

  if (!stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform-wide overview across every university and college"
        action={
          <div className="flex gap-3">
            <Link href="/super-admin/universities" className="text-sm text-primary font-medium underline underline-offset-2 flex items-center gap-1">
              Universities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/super-admin/colleges" className="text-sm text-primary font-medium underline underline-offset-2 flex items-center gap-1">
              Colleges <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Universities" value={stats.totalUniversities} icon={Building2} />
        <StatCard label="Colleges" value={stats.totalColleges} icon={School} />
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Premium Users" value={stats.totalPremiumUsers} icon={Crown} />
        <StatCard label="Resources" value={stats.totalNotes} icon={FileText} />
        <StatCard label="Events" value={stats.totalEvents} icon={Calendar} />
        <StatCard label="Marketplace Items" value={stats.totalListings} icon={ShoppingBag} />
      </motion.div>
    </div>
  )
}