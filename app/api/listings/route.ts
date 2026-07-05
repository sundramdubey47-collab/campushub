import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json({ error: "frist complete your onbording" }, { status: 400 })
  }

  const formData = await req.formData()
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const type = formData.get("type") as string
  const price = formData.get("price") as string
  const location = formData.get("location") as string
  const file = formData.get("file") as File | null

  if (!title || !category) {
    return NextResponse.json({ error: "Title and Category are required" }, { status: 400 })
  }

  let imageUrl = null

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image", folder: "campushub-marketplace" }, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
        .end(buffer)
    })

    imageUrl = uploadResult.secure_url
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      category: category as any,
      type: (type as any) || "SELL",
      price: price ? Number(price) : null,
      location,
      imageUrl,
      sellerId: dbUser.id,
      collegeId: dbUser.collegeId,
    },
  })

  return NextResponse.json(listing)
}

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json([])
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser?.collegeId) {
    return NextResponse.json([])
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const listings = await prisma.listing.findMany({
    where: {
      collegeId: dbUser.collegeId,
      status: "AVAILABLE",
      AND: [
        category ? { category: category as any } : {},
        search
          ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true } },
    },
  })

  return NextResponse.json(listings)
}