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

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission nahi hai" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const qrCode = body.qrCode

  const registration = await prisma.eventRegistration.findFirst({
    where: { qrCode, eventId: Number(id) },
    include: { user: { select: { name: true } } },
  })

  if (!registration) {
    return NextResponse.json({ error: "Invalid QR code" }, { status: 404 })
  }

  if (registration.attended) {
    return NextResponse.json({ error: `${registration.user.name} ki attendance pehle se lag chuki hai` }, { status: 400 })
  }

  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { attended: true },
  })

  return NextResponse.json({ success: true, name: registration.user.name })
}