import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const attempts = await prisma.testAttempt.findMany({
    where: { testId: Number(id), submittedAt: { not: null } },
    orderBy: { score: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(attempts)
}