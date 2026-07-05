import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const action = body.action

  const note = await prisma.note.findUnique({ where: { id: Number(id) } })

  if (!note) {
    return NextResponse.json({ error: "not found Note " }, { status: 404 })
  }

  if (action === "view") {
    await prisma.note.update({
      where: { id: Number(id) },
      data: { views: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  }

  // action === "download" — yahan Premium check hoga
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  if (note.isPremium && !dbUser.isPremium) {
    return NextResponse.json(
      { error: "PREMIUM_REQUIRED", message: "Unlock Premium to access exclusive notes for your upcoming exams" },
      { status: 403 }
    )
  }

  // Download allowed - counter badhao
  await prisma.note.update({
    where: { id: Number(id) },
    data: { downloads: { increment: 1 } },
  })

  // Agar note Premium tha aur downloader bhi Premium hai, to uploader ko coupon do
  if (note.isPremium && dbUser.isPremium && note.uploadedById !== dbUser.id) {
    const code = `CH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    await prisma.coupon.create({
      data: {
        code,
        discountPercent: 5,
        ownerId: note.uploadedById,
        sourceNoteId: note.id,
      },
    })
  }

  return NextResponse.json({ success: true, allowed: true })
}