import { NextResponse, after } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notifyCollege } from "@/lib/notify"

async function loadForEditor(idParam: string) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return { error: NextResponse.json({ error: "Login is required" }, { status: 401 }) }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, collegeId: true },
  })
  if (!user) return { error: NextResponse.json({ error: "Login is required" }, { status: 401 }) }

  const id = Number(idParam)
  if (!Number.isInteger(id)) return { error: NextResponse.json({ error: "Test not found" }, { status: 404 }) }

  const test = await prisma.test.findUnique({
    where: { id },
    include: { questions: { orderBy: { id: "asc" } } },
  })
  if (!test) return { error: NextResponse.json({ error: "Test not found" }, { status: 404 }) }

  const isCreator = test.createdById === user.id
  const isAdmin =
    user.role === "SUPER_ADMIN" || (user.role === "ADMIN" && user.collegeId === test.collegeId)

  if (!isCreator && !isAdmin) {
    return { error: NextResponse.json({ error: "Permission denied" }, { status: 403 }) }
  }

  return { user, test }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await loadForEditor(id)
  if (result.error) return result.error

  const t = result.test!
  return NextResponse.json({
    id: t.id,
    title: t.title,
    topic: t.topic,
    isPublished: t.isPublished,
    questions: t.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      correctIndex: q.correctIndex,
    })),
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await loadForEditor(id)
  if (result.error) return result.error

  const { user, test } = { user: result.user!, test: result.test! }

  if (test.isPublished) return NextResponse.json({ success: true, alreadyPublished: true })

  if (test.questions.length < 3) {
    return NextResponse.json({ error: "Publish karne ke liye kam se kam 3 questions chahiye" }, { status: 400 })
  }

  await prisma.test.update({ where: { id: test.id }, data: { isPublished: true } })

  after(() =>
    notifyCollege({
      collegeId: test.collegeId,
      type: "SYSTEM",
      title: "🧠 New free test available",
      body: test.title,
      link: `/tests/${test.id}`,
      excludeUserId: user.id,
      courseId: test.courseId,
      semesterId: test.semesterId,
    })
  )

  return NextResponse.json({ success: true })
}