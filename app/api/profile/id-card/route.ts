import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import QRCode from "qrcode"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    include: {
      college: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
    },
  })

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const idString = `CH-ID:${dbUser.id}:${dbUser.email}`
  const qrImage = await QRCode.toDataURL(idString)

  return NextResponse.json({
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    college: dbUser.college?.name,
    course: dbUser.course?.name,
    semester: dbUser.semester?.number,
    section: dbUser.section,
    avatarUrl: dbUser.avatarUrl,
    memberSince: dbUser.createdAt,
    qrImage,
    idNumber: `CH-${String(dbUser.id).padStart(6, "0")}`,
  })
}