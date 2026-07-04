import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const universities = await prisma.university.findMany()
  return NextResponse.json(universities)
}