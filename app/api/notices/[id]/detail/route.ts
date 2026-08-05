import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json({ error: "Login required" }, { status: 401 })

  const { id } = await params
  const notice = await prisma.notice.findUnique({
    where: { id: Number(id) },
    include: { postedBy: { select: { name: true, role: true } } },
  })

  if (!notice) return NextResponse.json({ error: "Notice not found" }, { status: 404 })

  return NextResponse.json(notice)
}