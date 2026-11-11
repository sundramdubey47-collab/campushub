import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const { id } = await params
  const noteId = Number(id)
  if (!Number.isInteger(noteId)) return NextResponse.json({ error: "Resource not found" }, { status: 404 })

  const note = await prisma.note.findUnique({ where: { id: noteId }, select: { uploadedById: true } })
  if (!note) return NextResponse.json({ error: "Resource not found" }, { status: 404 })

  // Sirf uploader apna resource delete kar sakta hai
  if (note.uploadedById !== user.id) {
    return NextResponse.json({ error: "You can only delete your own uploads" }, { status: 403 })
  }

  await prisma.$transaction([
    prisma.rating.deleteMany({ where: { noteId } }),
    prisma.bookmark.deleteMany({ where: { noteId } }),
    prisma.comment.deleteMany({ where: { noteId } }),
    prisma.coupon.updateMany({ where: { sourceNoteId: noteId }, data: { sourceNoteId: null } }),
    prisma.resourceRequest.updateMany({
      where: { fulfilledNoteId: noteId },
      data: { fulfilledNoteId: null, status: "OPEN", fulfilledAt: null },
    }),
    prisma.note.delete({ where: { id: noteId } }),
  ])

  return NextResponse.json({ success: true })
}