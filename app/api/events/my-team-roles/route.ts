import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })
  if (!dbUser) return NextResponse.json([])

  const memberships = await prisma.eventTeamMember.findMany({
    where: { userId: dbUser.id },
    select: { eventId: true, role: true },
  })

  return NextResponse.json(memberships)
}