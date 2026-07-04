import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser) {
    return NextResponse.json({ error: "User nahi mila" }, { status: 400 })
  }

  if (!["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json(
      { error: "Sirf Faculty/Admin notice bana sakte hain" },
      { status: 403 }
    )
  }

  if (!dbUser.collegeId) {
    return NextResponse.json({ error: "Aapki college set nahi hai" }, { status: 400 })
  }

  const body = await req.json()
  const { title, content, attachmentUrl, departmentId, courseId, semesterId, publishAt } = body

  if (!title || !content) {
    return NextResponse.json({ error: "Title aur content zaroori hai" }, { status: 400 })
  }

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      attachmentUrl: attachmentUrl || null,
      postedById: dbUser.id,
      collegeId: dbUser.collegeId,
      departmentId: departmentId ? Number(departmentId) : null,
      courseId: courseId ? Number(courseId) : null,
      semesterId: semesterId ? Number(semesterId) : null,
      publishAt: publishAt ? new Date(publishAt) : new Date(),
    },
  })

  return NextResponse.json(notice)
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const notices = await prisma.notice.findMany({
    where: {
      collegeId: dbUser.collegeId,
      isArchived: false,
      publishAt: { lte: new Date() },
      AND: [
        {
          OR: [
            { departmentId: null },
            { departmentId: dbUser.departmentId },
          ],
        },
        {
          OR: [
            { courseId: null },
            { courseId: dbUser.courseId },
          ],
        },
        {
          OR: [
            { semesterId: null },
            { semesterId: dbUser.semesterId },
          ],
        },
      ],
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      postedBy: { select: { name: true, role: true } },
    },
  })

  return NextResponse.json(notices)
}