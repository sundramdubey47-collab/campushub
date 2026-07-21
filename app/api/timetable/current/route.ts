import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser?.courseId || !dbUser?.semesterId) return NextResponse.json({ current: null, next: null })

  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const studentSection = dbUser.section || "A"

  const todaySlots = await prisma.timetableSlot.findMany({
    where: {
      courseId: dbUser.courseId,
      semesterId: dbUser.semesterId,
      dayOfWeek,
      OR: [{ section: studentSection }, { section: null }],
    },
    orderBy: { startTime: "asc" },
  })
console.log("===== USER DATA =====")
console.log({
  email: dbUser.email,
  collegeId: dbUser.collegeId,
  courseId: dbUser.courseId,
  semesterId: dbUser.semesterId,
  section: dbUser.section,
  dayOfWeek,
  currentTime,
})

console.log("===== TODAY SLOTS =====")
console.log(todaySlots)
  const current = todaySlots.find((s) => s.startTime <= currentTime && s.endTime > currentTime) ?? null
  const next = todaySlots.find((s) => s.startTime > currentTime) ?? null

  return NextResponse.json({ current, next })
}