import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const universityId = searchParams.get("universityId")

  if (!universityId) return NextResponse.json([])

  const colleges = await prisma.college.findMany({
    where: { universityId: Number(universityId) },
  })

  return NextResponse.json(colleges)
}