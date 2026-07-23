import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { normalizeHHMM } from "@/lib/time-utils"

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

  try {
    await prisma.timetableSlot.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete slot error:", err)
    return NextResponse.json({ error: "Could not delete this slot. Please try again." }, { status: 500 })
  }
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
      startTime: startTime ? normalizeHHMM(startTime) : undefined,
      endTime: endTime ? normalizeHHMM(endTime) : undefined,
      subjectName,
      room: room || null,
      facultyName: facultyName || null,
      section: section || "A",
    },
  })

  return NextResponse.json(slot)
}