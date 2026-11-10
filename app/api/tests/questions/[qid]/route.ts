import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatZodError } from "@/lib/validations"

const questionSchema = z
  .object({
    questionText: z.string().trim().min(3).max(500),
    options: z.array(z.string().trim().min(1).max(200)).min(2).max(6),
    correctIndex: z.number().int().min(0),
  })
  .refine((v) => v.correctIndex < v.options.length, { message: "Correct answer must be one of the options" })

async function loadQuestion(qidParam: string) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return { error: NextResponse.json({ error: "Login is required" }, { status: 401 }) }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, collegeId: true },
  })
  if (!user) return { error: NextResponse.json({ error: "Login is required" }, { status: 401 }) }

  const qid = Number(qidParam)
  if (!Number.isInteger(qid)) return { error: NextResponse.json({ error: "Question not found" }, { status: 404 }) }

  const question = await prisma.testQuestion.findUnique({
    where: { id: qid },
    include: { test: { select: { createdById: true, collegeId: true } } },
  })
  if (!question) return { error: NextResponse.json({ error: "Question not found" }, { status: 404 }) }

  const isCreator = question.test.createdById === user.id
  const isAdmin =
    user.role === "SUPER_ADMIN" || (user.role === "ADMIN" && user.collegeId === question.test.collegeId)

  if (!isCreator && !isAdmin) {
    return { error: NextResponse.json({ error: "Permission denied" }, { status: 403 }) }
  }

  return { question }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  const result = await loadQuestion(qid)
  if (result.error) return result.error

  const parsed = questionSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })

  const updated = await prisma.testQuestion.update({
    where: { id: result.question!.id },
    data: parsed.data,
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ qid: string }> }) {
  const { qid } = await params
  const result = await loadQuestion(qid)
  if (result.error) return result.error

  await prisma.testAnswer.deleteMany({ where: { questionId: result.question!.id } })
  await prisma.testQuestion.delete({ where: { id: result.question!.id } })
  return NextResponse.json({ success: true })
}