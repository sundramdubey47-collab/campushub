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
  const { name, code, collegeId } = body

  if (!name || !code || !collegeId) {
    return NextResponse.json({ error: "Sab fields zaroori hain" }, { status: 400 })
  }

  const department = await prisma.department.create({
    data: { name, code, collegeId: Number(collegeId) },
  })

  return NextResponse.json(department)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const collegeId = searchParams.get("collegeId")

  if (!collegeId) return NextResponse.json([])

  const departments = await prisma.department.findMany({ where: { collegeId: Number(collegeId) } })
  return NextResponse.json(departments)
}