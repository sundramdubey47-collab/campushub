import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Access Denied!" }, { status: 403 })
  }

  const body = await req.json()
  const { name, code, city, state } = body

  if (!name || !code) {
    return NextResponse.json({ error: "Name and Code are required" }, { status: 400 })
  }

  const university = await prisma.university.create({
    data: { name, code, city, state },
  })

  return NextResponse.json(university)
}

export async function GET() {
  const universities = await prisma.university.findMany({
    include: { _count: { select: { colleges: true } } },
  })
  return NextResponse.json(universities)
}