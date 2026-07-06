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
  const { name, code, durationYrs, departmentId } = body

  if (!name || !code || !departmentId) {
    return NextResponse.json({ error: "Sab fields zaroori hain" }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: { name, code, durationYrs: Number(durationYrs) || 4, departmentId: Number(departmentId) },
  })

  return NextResponse.json(course)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get("departmentId")

  if (!departmentId) return NextResponse.json([])

  const courses = await prisma.course.findMany({ where: { departmentId: Number(departmentId) } })
  return NextResponse.json(courses)
}