import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const { id } = await params
  await prisma.semester.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}