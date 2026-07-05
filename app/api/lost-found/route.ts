import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json({ error: "Pehle onboarding complete karo" }, { status: 400 })
  }

  const formData = await req.formData()
  const type = formData.get("type") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const location = formData.get("location") as string
  const contactNumber = formData.get("contactNumber") as string
  const reward = formData.get("reward") as string
  const file = formData.get("file") as File | null

  if (!type || !title) {
    return NextResponse.json({ error: "Type aur Title zaroori hai" }, { status: 400 })
  }

  let imageUrl = null

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", folder: "campushub-lostfound" }, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
        .end(buffer)
    })

    imageUrl = uploadResult.secure_url
  }

  const item = await prisma.lostFoundItem.create({
    data: {
      type: type as any,
      title,
      description,
      location,
      contactNumber,
      reward: type === "LOST" ? reward : null,
      imageUrl,
      reportedById: dbUser.id,
      collegeId: dbUser.collegeId,
    },
  })

  return NextResponse.json(item)
}

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const items = await prisma.lostFoundItem.findMany({
    where: { collegeId: dbUser.collegeId, isResolved: false },
    orderBy: { createdAt: "desc" },
    include: { reportedBy: { select: { id: true, name: true } } },
  })

  return NextResponse.json(items)
}