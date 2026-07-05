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

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Access denied!" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { userEmail } = body

  const targetUser = await prisma.user.findUnique({ where: { email: userEmail } })

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (targetUser.collegeId !== Number(id)) {
    return NextResponse.json({ error: "THis user is not for this college" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: targetUser.id },
    data: { role: "ADMIN", managedCollegeId: Number(id) },
  })

  return NextResponse.json({ success: true })
}