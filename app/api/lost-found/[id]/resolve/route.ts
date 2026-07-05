import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const { id } = await params

  const item = await prisma.lostFoundItem.findUnique({ where: { id: Number(id) } })

  if (!item) return NextResponse.json({ error: " No availableItem " }, { status: 404 })

  if (item.reportedById !== dbUser.id) {
    return NextResponse.json({ error: "only reporter can solve issue" }, { status: 403 })
  }

  await prisma.lostFoundItem.update({
    where: { id: Number(id) },
    data: { isResolved: true },
  })

  return NextResponse.json({ success: true })
}