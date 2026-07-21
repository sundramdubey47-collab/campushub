import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendPushNotificationToCollege } from "@/lib/notification-service"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (
      !dbUser ||
      !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)
    ) {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    if (dbUser.collegeId == null) {
      return NextResponse.json(
        { error: "College not set" },
        { status: 400 }
      )
    }

    const collegeId = dbUser.collegeId

    const body = await req.json()

    const {
      courseId,
      semesterId,
      rows,
      fileName,
    } = body

    if (
      !courseId ||
      !semesterId ||
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid import request" },
        { status: 400 }
      )
    }

    const validRows = rows.filter(
      (r: any) => !r.errors || r.errors.length === 0
    )

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows to import" },
        { status: 400 }
      )
    }

    // Remove old timetable
    await prisma.timetableSlot.deleteMany({
      where: {
        collegeId,
        courseId: Number(courseId),
        semesterId: Number(semesterId),
      },
    })

    // Import new timetable
    await prisma.timetableSlot.createMany({
      data: validRows.map((r: any) => ({
        dayOfWeek: Number(r.dayOfWeek),
        startTime: String(r.startTime),
        endTime: String(r.endTime),
        subjectName: String(r.subjectName),
        room: r.room || null,
        facultyName: r.facultyName || null,
        section: r.section || "A",
        collegeId,
        courseId: Number(courseId),
        semesterId: Number(semesterId),
      })),
    })

    // Save Version
    await prisma.timetableVersion.create({
      data: {
        fileName: fileName || "manual-import",
        courseId: Number(courseId),
        semesterId: Number(semesterId),
        collegeId,
        uploadedById: dbUser.id,
        rowCount: validRows.length,
      },
    })

    // Notify Students
    await sendPushNotificationToCollege({
      collegeId,
      title: "📅 Timetable Updated",
      body: "The timetable has been updated. Check your dashboard for the latest schedule.",
      url: "/timetable",
    })

    return NextResponse.json({
      success: true,
      imported: validRows.length,
    })
  } catch (error) {
    console.error("Timetable Import Error:", error)

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    )
  }
}