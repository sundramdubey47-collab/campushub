import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const collegeId = searchParams.get("collegeId")

  if (!collegeId) return NextResponse.json([])

  const courses = await prisma.course.findMany({
    where: { department: { collegeId: Number(collegeId) } },
  })

  return NextResponse.json(courses)
}