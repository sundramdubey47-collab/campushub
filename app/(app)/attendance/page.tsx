import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { CalendarCheck, TrendingUp, Check, X, MinusCircle } from "lucide-react"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatHistoryLine(name: string, date: Date, subject: string, status: string) {
  const day = DAY_NAMES[date.getDay()]
  const dateStr = date.toLocaleDateString("en-GB").replace(/\//g, "/")
  const statusText = status === "PRESENT" ? "attended" : status === "ABSENT" ? "missed" : "had no class held for"
  return `${name}, ${day} ${dateStr} ko ${subject} ka class ${statusText}`
}

export default async function AttendancePage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser) return <p className="text-red-500 text-sm">Could not load attendance</p>

  const allRecords = await prisma.attendance.findMany({
    where: { studentId: dbUser.id },
    orderBy: { date: "desc" },
    include: { timetableSlot: { select: { subjectName: true } } },
  })

  const countable = allRecords.filter((r) => r.status !== "NOT_CONDUCTED")
  const overallPresent = countable.filter((r) => r.status === "PRESENT").length
  const overallTotal = countable.length
  const overallPercent = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  const subjectMap: Record<string, { present: number; absent: number }> = {}
  countable.forEach((r) => {
    const subject = r.timetableSlot.subjectName
    if (!subjectMap[subject]) subjectMap[subject] = { present: 0, absent: 0 }
    if (r.status === "PRESENT") subjectMap[subject].present++
    else subjectMap[subject].absent++
  })

  const subjectWise = Object.entries(subjectMap).map(([subject, data]) => ({
    subject,
    present: data.present,
    absent: data.absent,
    percentage: Math.round((data.present / (data.present + data.absent)) * 100),
  }))

  const now = Date.now()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
  const weeklyRecords = countable.filter((r) => new Date(r.date) >= weekAgo)
  const monthlyRecords = countable.filter((r) => new Date(r.date) >= monthAgo)
  const weeklyPercent = weeklyRecords.length ? Math.round((weeklyRecords.filter((r) => r.status === "PRESENT").length / weeklyRecords.length) * 100) : 0
  const monthlyPercent = monthlyRecords.length ? Math.round((monthlyRecords.filter((r) => r.status === "PRESENT").length / monthlyRecords.length) * 100) : 0

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Attendance" description="Track your class attendance, subject by subject" />

      {overallTotal === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance marked yet" description="Mark your attendance from the dashboard as classes happen" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-4 text-center space-y-1">
              <p className="text-2xl font-bold">{overallPercent}%</p>
              <p className="text-[10px] text-muted-foreground">Overall</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center space-y-1">
              <p className="text-2xl font-bold">{weeklyPercent}%</p>
              <p className="text-[10px] text-muted-foreground">This Week</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center space-y-1">
              <p className="text-2xl font-bold">{monthlyPercent}%</p>
              <p className="text-[10px] text-muted-foreground">This Month</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Subject-wise Attendance
            </h2>
            <div className="space-y-2">
              {subjectWise.map((s) => (
                <div key={s.subject} className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{s.subject}</p>
                    <span className={`text-sm font-bold ${s.percentage < 75 ? "text-red-500" : "text-[oklch(var(--success))]"}`}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.percentage < 75 ? "bg-red-500" : "bg-[oklch(var(--success))]"}`}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Present: {s.present} • Absent: {s.absent}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-sm">History</h2>
            <div className="space-y-1.5">
              {allRecords.slice(0, 30).map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-lg border bg-card p-3 text-sm">
                  {r.status === "PRESENT" && <Check className="h-4 w-4 text-[oklch(var(--success))] shrink-0 mt-0.5" />}
                  {r.status === "ABSENT" && <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  {r.status === "NOT_CONDUCTED" && <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                  <span className="flex-1">{formatHistoryLine(dbUser.name, new Date(r.date), r.timetableSlot.subjectName, r.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}