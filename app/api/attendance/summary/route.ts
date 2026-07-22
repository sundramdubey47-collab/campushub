import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json(null)

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json(null)

  const allRecords = await prisma.attendance.findMany({
    where: { studentId: dbUser.id },
    orderBy: { date: "desc" },
    include: { timetableSlot: { select: { subjectName: true } } },
  })

  const countable = allRecords.filter((r) => r.status !== "NOT_CONDUCTED")

  // Overall
  const overallPresent = countable.filter((r) => r.status === "PRESENT").length
  const overallTotal = countable.length
  const overallPercent = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  // Subject-wise
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
    total: data.present + data.absent,
    percentage: Math.round((data.present / (data.present + data.absent)) * 100),
  }))

  // Weekly (last 7 days) / Monthly (last 30 days)
  const now = Date.now()
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

  const weeklyRecords = countable.filter((r) => new Date(r.date) >= weekAgo)
  const monthlyRecords = countable.filter((r) => new Date(r.date) >= monthAgo)

  const weeklyPercent = weeklyRecords.length > 0
    ? Math.round((weeklyRecords.filter((r) => r.status === "PRESENT").length / weeklyRecords.length) * 100)
    : 0
  const monthlyPercent = monthlyRecords.length > 0
    ? Math.round((monthlyRecords.filter((r) => r.status === "PRESENT").length / monthlyRecords.length) * 100)
    : 0

  const history = allRecords.slice(0, 30).map((r) => ({
    id: r.id,
    subject: r.timetableSlot.subjectName,
    date: r.date,
    status: r.status,
  }))

  return NextResponse.json({
    overallPercent,
    overallPresent,
    overallTotal,
    totalMarked: countable.length,
    subjectWise,
    weeklyPercent,
    monthlyPercent,
    history,
  })
}