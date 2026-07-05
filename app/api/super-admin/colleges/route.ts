import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission nahi hai" }, { status: 403 })
  }

  const body = await req.json()
  const { name, code, city, universityId } = body

  if (!name || !code || !universityId) {
    return NextResponse.json({ error: "Name, Code aur University zaroori hai" }, { status: 400 })
  }

  const college = await prisma.college.create({
    data: { name, code, city, universityId: Number(universityId) },
  })

  return NextResponse.json(college)
}

export async function GET() {
  const colleges = await prisma.college.findMany({
    include: {
      university: { select: { name: true } },
      admin: { select: { name: true, email: true } },
    },
  })
  return NextResponse.json(colleges)
}