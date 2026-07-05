"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"

type User = {
  id: number
  name: string
  email: string
  role: string
  isPremium: boolean
  createdAt: string
  department: { name: string } | null
  course: { name: string } | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadUsers() {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    const data = await res.json()

    if (!res.ok) setError(data.error)
    else setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function toggleFacultyRole(userId: number, currentRole: string) {
    const newRole = currentRole === "FACULTY" ? "STUDENT" : "FACULTY"
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    loadUsers()
  }

  if (error) return <p className="text-red-500 text-sm">{error}</p>

  return (
    <div className="space-y-5">
      <PageHeader title="Manage Users" description="View and manage everyone at your college" />

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.name} <span className="text-xs text-muted-foreground font-normal">({user.role})</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {user.department && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user.department.name} — {user.course?.name}
                  </p>
                )}
              </div>

              {["STUDENT", "FACULTY"].includes(user.role) && (
                <button
                  onClick={() => toggleFacultyRole(user.id, user.role)}
                  className="shrink-0 text-xs font-medium text-primary underline underline-offset-2"
                >
                  {user.role === "FACULTY" ? "Make Student" : "Make Faculty"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}