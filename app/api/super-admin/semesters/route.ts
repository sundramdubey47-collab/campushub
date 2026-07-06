import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission nahi hai" }, { status: 403 })
  }

  const body = await req.json()
  const { number, courseId } = body

  if (!number || !courseId) {
    return NextResponse.json({ error: "Sab fields zaroori hain" }, { status: 400 })
  }

  const semester = await prisma.semester.create({
    data: { number: Number(number), courseId: Number(courseId) },
  })

  return NextResponse.json(semester)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get("courseId")

  if (!courseId) return NextResponse.json([])

  const semesters = await prisma.semester.findMany({ where: { courseId: Number(courseId) }, orderBy: { number: "asc" } })
  return NextResponse.json(semesters)
}