import { NextResponse, after } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notifyCollege, notifyUser } from "@/lib/notify"

const CATEGORIES = [
  "NOTES", "ASSIGNMENT", "LAB_RECORD", "PREVIOUS_YEAR_PAPER", "BOOK", "PRESENTATION", "PRACTICAL_FILE",
  "QUESTION_BANK", "FACULTY_NOTES", "VIVA_QUESTIONS", "PROJECT", "SYLLABUS", "OTHERS",
]

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
}

// Sirf apne Cloudinary account ka, sahi folder ka, sahi type ka link manenge
function parseFileUrl(raw: unknown): { url: string; mime: string } | null {
  if (typeof raw !== "string") return null

  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  if (u.protocol !== "https:" || u.hostname !== "res.cloudinary.com") return null
  if (!cloud || !u.pathname.startsWith(`/${cloud}/`) || !u.pathname.includes("/campushub-notes/")) return null

  const ext = u.pathname.split(".").pop()?.toLowerCase()
  if (!ext || !MIME_BY_EXT[ext]) return null

  return { url: u.toString(), mime: MIME_BY_EXT[ext] }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Login to continue" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!dbUser || !dbUser.collegeId) {
      return NextResponse.json({ error: "First complete your onboarding" }, { status: 400 })
    }

    const college = await prisma.college.findUnique({ where: { id: dbUser.collegeId } })
    if (!college) return NextResponse.json({ error: "College not found" }, { status: 400 })

    const body = await req.json().catch(() => ({}))

    const title = typeof body.title === "string" ? body.title.trim() : ""
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : ""
    const unit = typeof body.unit === "string" ? body.unit.trim().slice(0, 50) : ""
    const courseId = Number(body.courseId)
    const semesterId = Number(body.semesterId)
    const subjectId = body.subjectId ? Number(body.subjectId) : null
    const category = CATEGORIES.includes(body.category) ? body.category : "NOTES"
    const fulfillsRequestId = body.fulfillsRequestId ? Number(body.fulfillsRequestId) : null

    // Paid features launch par band hain, isliye premium tabhi jab payments on hon
    const isPremium = body.isPremium === true && process.env.PAYMENTS_ENABLED === "true"

    if (!title || title.length > 200 || !Number.isInteger(courseId) || !Number.isInteger(semesterId)) {
      return NextResponse.json({ error: "Title, Branch, Semester and file are required" }, { status: 400 })
    }

    const file = parseFileUrl(body.fileUrl)
    if (!file) {
      return NextResponse.json({ error: "Upload did not finish properly. Please try again." }, { status: 400 })
    }

    // Branch aur semester usi college ke hone chahiye
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { department: true },
    })
    if (!course || course.department.collegeId !== dbUser.collegeId) {
      return NextResponse.json({ error: "Invalid branch selected" }, { status: 400 })
    }

    const semester = await prisma.semester.findUnique({ where: { id: semesterId } })
    if (!semester || semester.courseId !== courseId) {
      return NextResponse.json({ error: "Invalid semester selected" }, { status: 400 })
    }

    if (subjectId !== null) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
      if (!subject || subject.semesterId !== semesterId) {
        return NextResponse.json({ error: "Invalid subject selected" }, { status: 400 })
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        description: description || null,
        fileUrl: file.url,
        fileType: file.mime,
        category: category as any,
        isPremium,
        unit: unit || null,
        uploadedById: dbUser.id,
        universityId: college.universityId,
        courseId,
        semesterId,
        subjectId,
      },
    })

    if (fulfillsRequestId && Number.isInteger(fulfillsRequestId)) {
      const request = await prisma.resourceRequest.findFirst({
        where: { id: fulfillsRequestId, collegeId: dbUser.collegeId, status: "OPEN" },
      })

      if (request) {
        await prisma.resourceRequest.update({
          where: { id: request.id },
          data: { status: "FULFILLED", fulfilledAt: new Date(), fulfilledNoteId: note.id },
        })

        after(() =>
          notifyUser({
            userId: request.requestedById,
            type: "RESOURCE_FULFILLED",
            title: "🎉 Your request is fulfilled!",
            body: `"${request.title}" is now available on CampusHub`,
            link: `/notes/${note.id}`,
          })
        )
      }
    }

    after(() =>
      notifyCollege({
        collegeId: college.id,
        type: "RESOURCE",
        title: "📄 New Resource Uploaded",
        body: `"${title}" is now available`,
        link: `/notes/${note.id}`,
        excludeUserId: dbUser.id,
        courseId,
        semesterId,
      })
    )

    return NextResponse.json({ message: "Uploaded successfully", note })
  } catch (err) {
    console.error("[notes] upload failed:", err)
    return NextResponse.json({ error: "Could not save your upload. Please try again." }, { status: 500 })
  }
}