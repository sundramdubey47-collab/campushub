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

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } })

  if (!targetUser || targetUser.collegeId !== dbUser.collegeId) {
    return NextResponse.json({ error: "User does not belong to your college" }, { status: 403 })
  }

  // Admin sirf STUDENT ko FACULTY bana sakta hai, ya wapas STUDENT
  // Kisi ko ADMIN/SUPER_ADMIN nahi bana sakta (wo Super Admin ka kaam hai)
  if (body.role && !["STUDENT", "FACULTY"].includes(body.role)) {
    return NextResponse.json({ error: "Only Students/Faculty roles can be assigned" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { role: body.role },
  })

  return NextResponse.json(updated)
}