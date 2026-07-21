import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser?.courseId || !dbUser?.semesterId) return NextResponse.json([])

  const slots = await prisma.timetableSlot.findMany({
    where: { courseId: dbUser.courseId, semesterId: dbUser.semesterId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })

  return NextResponse.json(slots)
}