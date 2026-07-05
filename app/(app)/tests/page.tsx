"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

type Test = {
  id: number
  title: string
  topic: string
  difficulty: string
  durationMinutes: number
  isPremium: boolean
  price: number | null
  createdBy: { name: string }
  _count: { questions: number; attempts: number }
}

export default function TestsPage() {
  const { data: session } = useSession()
  const canCreate = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role)

  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tests")
      .then((r) => r.json())
      .then((data) => {
        setTests(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Test Series</h1>
        {canCreate && (
          <Link href="/tests/create">
            <Button>Test Banao</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Load ho raha hai...</p>
      ) : tests.length === 0 ? (
        <p className="text-muted-foreground">Koi test nahi hai</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <Link key={test.id} href={`/tests/${test.id}`}>
              <div className="border rounded-lg p-4 space-y-2 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold">{test.title}</h2>
                  {test.isPremium && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                      ₹{test.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{test.topic}</p>
                <div className="flex gap-1">
                  <span className="text-xs bg-muted px-2 py-1 rounded">{test.difficulty}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{test.durationMinutes} min</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{test._count.questions} Qs</span>
                </div>
                <p className="text-xs text-muted-foreground">By {test.createdBy.name} • {test._count.attempts} attempts</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}