import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { validateFile, validateFileSignature, ALLOWED_IMAGE_TYPES } from "@/lib/file-validation"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const dbUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? "" },
      select: { id: true, collegeId: true },
    })
    if (!dbUser?.collegeId) return NextResponse.json({ error: "Login is required" }, { status: 401 })

    const rate = checkRateLimit(`event-banner:${dbUser.id}`, RATE_LIMITS.AUTHENTICATED_LOOSE)
    if (!rate.allowed) return NextResponse.json({ error: "Too many uploads. Please slow down." }, { status: 429 })

    const fd = await req.formData()
    const file = fd.get("file")
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const fileError = validateFile(file, ALLOWED_IMAGE_TYPES)
    if (fileError) return NextResponse.json({ error: fileError }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    if (!validateFileSignature(buffer, file.type)) {
      return NextResponse.json({ error: "File content doesn't match its declared type" }, { status: 400 })
    }

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", folder: "campushub-events", quality: "auto:best" }, (err, res) =>
          err ? reject(err) : resolve(res)
        )
        .end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error("[events] banner upload failed:", err)
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}