import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const notice = await prisma.notice.update({
    where: { id: Number(id) },
    data: {
      ...(body.isPinned !== undefined ? { isPinned: body.isPinned } : {}),
      ...(body.isArchived !== undefined ? { isArchived: body.isArchived } : {}),
    },
  })

  return NextResponse.json(notice)
}