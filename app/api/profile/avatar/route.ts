import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { validateFile, validateFileSignature, ALLOWED_IMAGE_TYPES } from "@/lib/file-validation"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 400 })

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const fileError = validateFile(file, ALLOWED_IMAGE_TYPES, 5 * 1024 * 1024) // 5MB max for avatars
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (!validateFileSignature(buffer, file.type)) {
    return NextResponse.json({ error: "File content doesn't match its declared type" }, { status: 400 })
  }

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder: "campushub-avatars", transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }] },
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
      .end(buffer)
  })

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { avatarUrl: uploadResult.secure_url },
  })

  return NextResponse.json({ avatarUrl: uploadResult.secure_url })
}