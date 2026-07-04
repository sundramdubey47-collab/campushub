import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get("courseId")

  if (!courseId) {
    return NextResponse.json([])
  }

  const semesters = await prisma.semester.findMany({
    where: { courseId: Number(courseId) },
    orderBy: { number: "asc" },
  })

  return NextResponse.json(semesters)
}