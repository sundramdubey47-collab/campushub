import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to contiue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json({ error: "Frist complete your onboarding" }, { status: 400 })
  }

  const formData = await req.formData()
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const pricingType = formData.get("pricingType") as string
  const price = formData.get("price") as string
  const securityDeposit = formData.get("securityDeposit") as string
  const file = formData.get("file") as File | null

  if (!title || !category || !price) {
    return NextResponse.json({ error: "Title, Category and Price are required hai" }, { status: 400 })
  }

  let imageUrl = null

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", folder: "campushub-rentals" }, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
        .end(buffer)
    })

    imageUrl = uploadResult.secure_url
  }

  const item = await prisma.rentalItem.create({
    data: {
      title,
      description,
      category: category as any,
      pricingType: (pricingType as any) || "DAILY",
      price: Number(price),
      securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
      imageUrl,
      ownerId: dbUser.id,
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

  const items = await prisma.rentalItem.findMany({
    where: { collegeId: dbUser.collegeId, status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  })

  return NextResponse.json(items)
}