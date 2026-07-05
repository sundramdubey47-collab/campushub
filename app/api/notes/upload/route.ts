import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to contiue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser || !dbUser.collegeId) {
    return NextResponse.json(
      { error: "Frist complete your onboarding" },
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
  const unit = formData.get("unit") as string

  if (!file || !title || !courseId || !semesterId) {
    return NextResponse.json(
      { error: "Title, Branch, Semester and files are required" },
      { status: 400 }
    )
  }

  // Security check: semester usी college ki hi branch ka hona chahiye
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
    include: { department: true },
  })

  if (!course || course.department.collegeId !== dbUser.collegeId) {
    return NextResponse.json({ error: "Select wrong branch" }, { status: 400 })
  }

  const semester = await prisma.semester.findUnique({
    where: { id: Number(semesterId) },
  })

  if (!semester || semester.courseId !== Number(courseId)) {
    return NextResponse.json({ error: "Select wrong branch" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

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
      unit: unit || null,
      uploadedById: dbUser.id,
      universityId: college.universityId,
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      subjectId: subjectId ? Number(subjectId) : null,
    },
  })

  return NextResponse.json({ message: "Uploaded successfully", note })
}