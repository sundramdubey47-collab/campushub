import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const { id } = await params
  await prisma.timetableSlot.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { dayOfWeek, startTime, endTime, subjectName, room, facultyName, section } = body

  const slot = await prisma.timetableSlot.update({
    where: { id: Number(id) },
    data: {
      dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
      startTime,
      endTime,
      subjectName,
      room: room || null,
      facultyName: facultyName || null,
      section: section || "A",
    },
  })

  return NextResponse.json(slot)
}