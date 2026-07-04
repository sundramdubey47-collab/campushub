import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const note = await prisma.note.findUnique({
    where: { id: Number(id) },
    include: {
      uploadedBy: { select: { name: true, college: { select: { name: true } } } },
      university: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
      subject: { select: { name: true } },
    },
  })

  if (!note) {
    return NextResponse.json({ error: "Note nahi mila" }, { status: 404 })
  }

  return NextResponse.json(note)
}