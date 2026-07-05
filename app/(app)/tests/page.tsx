"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { Brain, Plus, Clock, HelpCircle, Users, Lock, Sparkles, ArrowRight } from "lucide-react"

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

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]",
  MEDIUM: "bg-[oklch(0.72_0.15_60/0.15)] text-[oklch(0.5_0.15_60)]",
  HARD: "bg-red-500/15 text-red-600 dark:text-red-400",
}

export default function TestsPage() {
  const { data: session } = useSession()
  const canCreate = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role)

  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(true) // default true taaki banner flash na ho load hote waqt

  useEffect(() => {
    fetch("/api/tests")
      .then((r) => r.json())
      .then((data) => {
        setTests(data)
        setLoading(false)
      })
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setIsPremium(!!d.isPremium))
  }, [])

  const premiumTestCount = tests.filter((t) => t.isPremium).length

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Test Series"
        description="Practice with AI-generated tests tailored to your syllabus"
        action={
          canCreate && (
            <Link href="/tests/create">
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Test</Button>
            </Link>
          )
        }
      />

      {!isPremium && premiumTestCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[oklch(var(--premium)/0.4)] bg-gradient-to-r from-[oklch(var(--premium)/0.12)] to-transparent p-5"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[oklch(var(--premium)/0.2)] p-2 shrink-0">
                <Sparkles className="h-5 w-5 text-[oklch(var(--premium))]" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {premiumTestCount} Premium test{premiumTestCount > 1 ? "s" : ""} waiting for you
                </p>
                <p className="text-xs text-muted-foreground">
                  Get unlimited access to every premium test, resource, and download — starting at just ₹49/week.
                </p>
              </div>
            </div>
            <Link href="/premium">
              <Button size="sm" className="bg-[oklch(var(--premium))] text-[oklch(var(--premium-foreground))] hover:opacity-90 whitespace-nowrap">
                Go Premium <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : tests.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No tests available yet"
          description="Once your faculty creates a test, it'll show up here — ready for you to attempt"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              whileHover={{ y: -3 }}
            >
              <Link href={`/tests/${test.id}`}>
                <div
                  className={`relative rounded-xl border p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow h-full ${
                    test.isPremium && !isPremium
                      ? "bg-gradient-to-br from-[oklch(var(--premium)/0.08)] to-card border-[oklch(var(--premium)/0.35)]"
                      : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-sm leading-snug">{test.title}</h2>
                    {test.isPremium ? (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium bg-[oklch(var(--premium)/0.18)] text-[oklch(var(--premium))] px-2 py-0.5 rounded-full">
                        <Lock className="h-2.5 w-2.5" /> {isPremium ? "Premium" : `₹${test.price}`}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-medium bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))] px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{test.topic}</p>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[test.difficulty]}`}>
                      {test.difficulty}
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {test.durationMinutes} min
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                      <HelpCircle className="h-2.5 w-2.5" /> {test._count.questions} Qs
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground pt-1 border-t flex items-center gap-1.5">
                    <Users className="h-3 w-3" /> {test._count.attempts} attempted • by {test.createdBy.name}
                  </p>

                  {test.isPremium && !isPremium && (
                    <p className="text-[11px] font-medium text-[oklch(var(--premium))] flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Unlock with Premium or ₹{test.price}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}