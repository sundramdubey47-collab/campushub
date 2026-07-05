import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User nahi mila" }, { status: 400 })

  const { id } = await params

  const item = await prisma.lostFoundItem.findUnique({ where: { id: Number(id) } })

  if (!item) return NextResponse.json({ error: "Item nahi mila" }, { status: 404 })

  if (item.reportedById !== dbUser.id) {
    return NextResponse.json({ error: "Sirf report karne wala hi isse resolve kar sakta hai" }, { status: 403 })
  }

  await prisma.lostFoundItem.update({
    where: { id: Number(id) },
    data: { isResolved: true },
  })

  return NextResponse.json({ success: true })
}