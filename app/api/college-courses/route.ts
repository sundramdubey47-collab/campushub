import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const courses = await prisma.course.findMany({
    where: {
      department: {
        collegeId: dbUser.collegeId,
      },
    },
  })

  return NextResponse.json(courses)
}