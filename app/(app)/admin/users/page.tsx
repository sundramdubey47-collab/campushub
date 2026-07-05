"use client"

import { useEffect, useState } from "react"

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

    if (!res.ok) {
      setError(data.error)
    } else {
      setUsers(data)
    }
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

  if (error) return <p className="text-red-500">{error}</p>
  if (loading) return <p className="text-muted-foreground">Load ho raha hai...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users Manage Karo</h1>

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">
                {user.name} <span className="text-xs text-muted-foreground">({user.role})</span>
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.department && (
                <p className="text-xs text-muted-foreground">
                  {user.department.name} — {user.course?.name}
                </p>
              )}
            </div>

            {["STUDENT", "FACULTY"].includes(user.role) && (
              <button
                onClick={() => toggleFacultyRole(user.id, user.role)}
                className="text-sm text-primary underline"
              >
                {user.role === "FACULTY" ? "Student Banao" : "Faculty Banao"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}