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
  const { name, code, semesterId } = body

  if (!name || !code || !semesterId) {
    return NextResponse.json({ error: "Sab fields zaroori hain" }, { status: 400 })
  }

  const subject = await prisma.subject.create({
    data: { name, code, semesterId: Number(semesterId) },
  })

  return NextResponse.json(subject)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const semesterId = searchParams.get("semesterId")

  if (!semesterId) return NextResponse.json([])

  const subjects = await prisma.subject.findMany({ where: { semesterId: Number(semesterId) } })
  return NextResponse.json(subjects)
}