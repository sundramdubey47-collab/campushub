import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

  const test = await prisma.test.findUnique({
    where: { id: Number(id) },
    include: {
      _count: { select: { questions: true } },
      createdBy: { select: { name: true } },
    },
  })

  if (!test) return NextResponse.json({ error: "Test nahi mila" }, { status: 404 })

  let hasAccess = !test.isPremium

  if (!hasAccess) {
    if (dbUser.isPremium) {
      hasAccess = true
    } else {
      const purchase = await prisma.testPurchase.findUnique({
        where: { userId_testId: { userId: dbUser.id, testId: test.id } },
      })
      hasAccess = !!purchase
    }
  }

  return NextResponse.json({ ...test, hasAccess })
}