import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const semesterId = searchParams.get("semesterId")

  if (!semesterId) {
    return NextResponse.json([])
  }

  const subjects = await prisma.subject.findMany({
    where: { semesterId: Number(semesterId) },
  })

  return NextResponse.json(subjects)
}