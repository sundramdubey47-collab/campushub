import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const listing = await prisma.listing.findUnique({
    where: { id: Number(id) },
    include: { seller: { select: { id: true, name: true } } },
  })

  if (!listing) {
    return NextResponse.json({ error: "Listing nahi mili" }, { status: 404 })
  }

  return NextResponse.json(listing)
}