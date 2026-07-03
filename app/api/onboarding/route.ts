import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const body = await req.json()
  const { collegeId, departmentId, courseId, semesterId } = body

  if (!collegeId || !departmentId || !courseId || !semesterId) {
    return NextResponse.json({ error: "Sab fields zaroori hain" }, { status: 400 })
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      collegeId: Number(collegeId),
      departmentId: Number(departmentId),
      courseId: Number(courseId),
      semesterId: Number(semesterId),
    },
  })

  return NextResponse.json({ message: "Onboarding complete" })
}