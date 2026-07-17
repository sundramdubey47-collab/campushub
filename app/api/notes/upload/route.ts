import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { validateFile, validateFileSignature, ALLOWED_DOCUMENT_TYPES } from "@/lib/file-validation"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser || !dbUser.collegeId) {
    return NextResponse.json(
      { error: "First complete your onboarding" },
      { status: 400 }
    )
  }

  const college = await prisma.college.findUnique({
    where: { id: dbUser.collegeId },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found" }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const courseId = formData.get("courseId") as string
  const semesterId = formData.get("semesterId") as string
  const subjectId = formData.get("subjectId") as string
  const category = formData.get("category") as string
  const isPremium = formData.get("isPremium") === "true"
  const unit = formData.get("unit") as string
const fulfillsRequestId = formData.get("fulfillsRequestId") as string

  if (!file || !title || !courseId || !semesterId) {
    return NextResponse.json(
      { error: "Title, Branch, Semester and file are required" },
      { status: 400 }
    )
  }

  const fileError = validateFile(file, ALLOWED_DOCUMENT_TYPES)
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 })
  }

  // Security check: semester usी college ki hi branch ka hona chahiye
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
    include: { department: true },
  })

  if (!course || course.department.collegeId !== dbUser.collegeId) {
    return NextResponse.json({ error: "Invalid branch selected" }, { status: 400 })
  }

  const semester = await prisma.semester.findUnique({
    where: { id: Number(semesterId) },
  })

  if (!semester || semester.courseId !== Number(courseId)) {
    return NextResponse.json({ error: "Invalid semester selected" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (!validateFileSignature(buffer, file.type)) {
    return NextResponse.json({ error: "File content doesn't match its declared type" }, { status: 400 })
  }

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "auto", folder: "campushub-notes" }, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
      .end(buffer)
  })

  const note = await prisma.note.create({
    data: {
      title,
      description,
      fileUrl: uploadResult.secure_url,
      fileType: file.type,
      category: (category as any) || "NOTES",
      isPremium,
      unit: unit || null,
      uploadedById: dbUser.id,
      universityId: college.universityId,
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      subjectId: subjectId ? Number(subjectId) : null,
    },
  })

if (fulfillsRequestId) {
  await prisma.resourceRequest.update({
    where: { id: Number(fulfillsRequestId) },
    data: { status: "FULFILLED", fulfilledAt: new Date(), fulfilledNoteId: note.id },
  })
}

  return NextResponse.json({ message: "Uploaded successfully", note })
}