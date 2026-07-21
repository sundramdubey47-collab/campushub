import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { parseTimetableFile } from "@/lib/timetable-parser"
import { validateFile, ALLOWED_DOCUMENT_TYPES } from "@/lib/file-validation"

export async function POST(req: Request) {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }

  const allowedExcelTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ]

  if (!allowedExcelTypes.includes(file.type)) {
    return NextResponse.json({ error: "Please upload an Excel (.xlsx) or CSV file" }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  try {
    const parsedRows = parseTimetableFile(buffer)
    const errorCount = parsedRows.filter((r) => r.errors.length > 0).length
    const sections = [...new Set(parsedRows.map((r) => r.section))]

    return NextResponse.json({
      rows: parsedRows,
      totalRows: parsedRows.length,
      errorCount,
      sections,
      fileName: file.name,
    })
  } catch (err) {
    console.error("Timetable parse error:", err)
    return NextResponse.json({ error: "Could not read this file. Please check the format." }, { status: 400 })
  }
}