import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function currentUser() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, courseId: true, semesterId: true, section: true, course: { select: { name: true } } },
  })
}

export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const semesters = user.courseId
    ? await prisma.semester.findMany({
        where: { courseId: user.courseId },
        orderBy: { number: "asc" },
        select: { id: true, number: true },
      })
    : []

  return NextResponse.json({
    courseName: user.course?.name ?? null,
    semesterId: user.semesterId,
    section: user.section,
    semesters,
  })
}

export async function PATCH(req: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })
  if (!user.courseId) return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const data: { semesterId?: number; section?: string | null } = {}

  if (body.semesterId !== undefined) {
    const semester = await prisma.semester.findFirst({
      where: { id: Number(body.semesterId), courseId: user.courseId },
      select: { id: true },
    })
    if (!semester) return NextResponse.json({ error: "Invalid semester for your branch" }, { status: 400 })
    data.semesterId = semester.id
  }

  if (body.section !== undefined) {
    const section = String(body.section ?? "").trim().toUpperCase()
    if (section && !/^[A-Z0-9]{1,5}$/.test(section)) {
      return NextResponse.json({ error: "Section should be 1-5 letters or digits, like A or B2" }, { status: 400 })
    }
    data.section = section || null
  }

  await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ success: true })
}