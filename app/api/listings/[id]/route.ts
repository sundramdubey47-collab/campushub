import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const listing = await prisma.listing.findUnique({
    where: { id: Number(id) },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      images: true,
    },
  })

  if (!listing) {
    return NextResponse.json(
      { error: "Listing not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(listing)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: {
      email: session?.user?.email ?? "",
    },
  })

  if (!dbUser) {
    return NextResponse.json(
      { error: "Login is required" },
      { status: 401 }
    )
  }

  const { id } = await params

  const listing = await prisma.listing.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!listing) {
    return NextResponse.json(
      { error: "Listing not found" },
      { status: 404 }
    )
  }

  if (listing.sellerId !== dbUser.id) {
    return NextResponse.json(
      { error: "You can only delete your own listings" },
      { status: 403 }
    )
  }

  await prisma.listing.delete({
    where: {
      id: Number(id),
    },
  })

  return NextResponse.json({ success: true })
}