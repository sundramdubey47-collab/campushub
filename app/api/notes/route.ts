import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const universityId = searchParams.get("universityId")
  const collegeId = searchParams.get("collegeId")
  const courseId = searchParams.get("courseId")
  const semesterId = searchParams.get("semesterId")
  const subjectId = searchParams.get("subjectId")
  const category = searchParams.get("category")

  const notes = await prisma.note.findMany({
    where: {
      AND: [
        universityId ? { universityId: Number(universityId) } : {},
        courseId ? { courseId: Number(courseId) } : {},
        semesterId ? { semesterId: Number(semesterId) } : {},
        subjectId ? { subjectId: Number(subjectId) } : {},
        category ? { category: category as any } : {},
        collegeId
          ? { uploadedBy: { collegeId: Number(collegeId) } }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: {
        select: {
          name: true,
          college: { select: { name: true } },
        },
      },
      university: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
      subject: { select: { name: true } },
    },
  })

  return NextResponse.json(notes)
}