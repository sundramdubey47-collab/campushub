import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login to continue" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      college: { select: { name: true } },
      department: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
      uploadedNotes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, views: true, downloads: true, createdAt: true },
      },
      coupons: {
        orderBy: { createdAt: "desc" },
      },
      buyerOrders: {
        orderBy: { createdAt: "desc" },
        include: { listing: { select: { title: true, imageUrl: true } } },
      },
      bookmarks: {
        orderBy: { createdAt: "desc" },
        include: { note: { select: { id: true, title: true } } },
      },
      ratings: true,
    },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const totalDownloadsReceived = dbUser.uploadedNotes.reduce((sum, n) => sum + n.downloads, 0)

  return NextResponse.json({
    ...dbUser,
    passwordHash: undefined,
    totalDownloadsReceived,
  })
}