import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission nahi hai" }, { status: 403 })
  }

  if (!dbUser.collegeId) {
    return NextResponse.json({ error: "Aapki college set nahi hai" }, { status: 400 })
  }

  const collegeId = dbUser.collegeId

  const [totalStudents, totalFaculty, totalNotes, totalEvents, totalListings, pendingReports] = await Promise.all([
    prisma.user.count({ where: { collegeId, role: "STUDENT" } }),
    prisma.user.count({ where: { collegeId, role: "FACULTY" } }),
    prisma.note.count({ where: { uploadedBy: { collegeId } } }),
    prisma.event.count({ where: { collegeId } }),
    prisma.listing.count({ where: { collegeId } }),
    prisma.notice.count({ where: { collegeId } }),
  ])

  return NextResponse.json({
    totalStudents,
    totalFaculty,
    totalNotes,
    totalEvents,
    totalListings,
    totalNotices: pendingReports,
  })
}