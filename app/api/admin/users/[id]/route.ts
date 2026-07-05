import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission nahi hai" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } })

  if (!targetUser || targetUser.collegeId !== dbUser.collegeId) {
    return NextResponse.json({ error: "Ye user aapki college ka nahi hai" }, { status: 403 })
  }

  // Admin sirf STUDENT ko FACULTY bana sakta hai, ya wapas STUDENT
  // Kisi ko ADMIN/SUPER_ADMIN nahi bana sakta (wo Super Admin ka kaam hai)
  if (body.role && !["STUDENT", "FACULTY"].includes(body.role)) {
    return NextResponse.json({ error: "Sirf Student/Faculty role set kar sakte hain" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { role: body.role },
  })

  return NextResponse.json(updated)
}