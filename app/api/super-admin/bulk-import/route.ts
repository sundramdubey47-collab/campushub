import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type Row = {
  Department: string
  BranchName: string
  BranchCode: string
  DurationYears: string
  SemesterNumber: string
  SubjectName: string
  SubjectCode: string
}

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const body = await req.json()
  const { collegeId, rows } = body as { collegeId: number; rows: Row[] }

  if (!collegeId || !rows?.length) {
    return NextResponse.json({ error: "College and rows are required" }, { status: 400 })
  }

  let created = { departments: 0, courses: 0, semesters: 0, subjects: 0 }
  const deptCache = new Map<string, number>()
  const courseCache = new Map<string, number>()
  const semesterCache = new Map<string, number>()

  for (const row of rows) {
    if (!row.Department || !row.BranchName || !row.SemesterNumber || !row.SubjectName) continue

    // Department
    const deptKey = row.Department
    let departmentId = deptCache.get(deptKey)
    if (!departmentId) {
      let dept = await prisma.department.findFirst({
        where: { collegeId: Number(collegeId), name: row.Department },
      })
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: row.Department, code: row.Department.slice(0, 5).toUpperCase(), collegeId: Number(collegeId) },
        })
        created.departments++
      }
      departmentId = dept.id
      deptCache.set(deptKey, departmentId)
    }

    // Course / Branch
    const courseKey = `${departmentId}-${row.BranchCode}`
    let courseId = courseCache.get(courseKey)
    if (!courseId) {
      let course = await prisma.course.findFirst({
        where: { departmentId, code: row.BranchCode },
      })
      if (!course) {
        course = await prisma.course.create({
          data: {
            name: row.BranchName,
            code: row.BranchCode,
            durationYrs: Number(row.DurationYears) || 4,
            departmentId,
          },
        })
        created.courses++
      }
      courseId = course.id
      courseCache.set(courseKey, courseId)
    }

    // Semester
    const semKey = `${courseId}-${row.SemesterNumber}`
    let semesterId = semesterCache.get(semKey)
    if (!semesterId) {
      let semester = await prisma.semester.findFirst({
        where: { courseId, number: Number(row.SemesterNumber) },
      })
      if (!semester) {
        semester = await prisma.semester.create({
          data: { number: Number(row.SemesterNumber), courseId },
        })
        created.semesters++
      }
      semesterId = semester.id
      semesterCache.set(semKey, semesterId)
    }

    // Subject
    const existingSubject = await prisma.subject.findFirst({
      where: { semesterId, code: row.SubjectCode },
    })
    if (!existingSubject) {
      await prisma.subject.create({
        data: { name: row.SubjectName, code: row.SubjectCode || row.SubjectName.slice(0, 5).toUpperCase(), semesterId },
      })
      created.subjects++
    }
  }

  return NextResponse.json({ success: true, created })
}