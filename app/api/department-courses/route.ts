import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get("departmentId")

  if (!departmentId) return NextResponse.json([])

  const courses = await prisma.course.findMany({
    where: { departmentId: Number(departmentId) },
  })

  return NextResponse.json(courses)
}