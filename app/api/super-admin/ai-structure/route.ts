
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { getAIResponse } from "@/lib/ai-provider"

const MAX_CHARS = 12000
const MAX_ROWS = 300

function codeFrom(text: string) {
  const letters = text
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (letters || "SUB").slice(0, 6)
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    const dbUser = await prisma.user.findUnique({
      where: { email: session?.user?.email ?? "" },
      select: { id: true, role: true },
    })

    if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Permission denied" },
        { status: 403 }
      )
    }

    const rate = checkRateLimit(
      `ai-structure:${dbUser.id}`,
      RATE_LIMITS.AUTHENTICATED_LOOSE
    )

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a bit." },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const text = typeof body.text === "string" ? body.text.trim() : ""

    if (text.length < 20) {
      return NextResponse.json(
        { error: "Syllabus text paste karo (kam se kam kuch lines)" },
        { status: 400 }
      )
    }

    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        {
          error:
            "Text bahut lamba hai. Ek baar me ek branch ya 2-3 semester paste karo.",
        },
        { status: 400 }
      )
    }

    const hint = (key: string) =>
      typeof body[key] === "string"
        ? body[key].trim().slice(0, 100)
        : ""

    const department = hint("department")
    const branchName = hint("branchName")
    const branchCode = hint("branchCode")
    const duration = Number(body.durationYears) || 4

    const system = `You convert raw college syllabus text into structured rows.

Return ONLY a valid JSON object in this exact format:
{
  "rows": [
    {
      "Department": "",
      "BranchName": "",
      "BranchCode": "",
      "SemesterNumber": "1",
      "SubjectName": "",
      "SubjectCode": ""
    }
  ]
}

Rules:
- One row per subject.
- Include labs and practicals as separate subjects if listed.
- SemesterNumber must be an integer from 1 to 12.
- Use the subject code printed in the text if present, otherwise leave SubjectCode empty.
- Do NOT invent subjects that are not in the text.
- Do not include Markdown, explanations, or code fences.
- Ensure the response is valid JSON.
${department ? `- Department is always "${department}".` : ""}
${branchName ? `- BranchName is always "${branchName}".` : ""}
${branchCode ? `- BranchCode is always "${branchCode}".` : ""}`

    const aiResponse = await getAIResponse(
      [
        {
          role: "user",
          content: `Convert this syllabus into the required JSON format:\n\n${text}`,
        },
      ],
      system
    )

    let parsed: any = {}

    try {
      const cleaned = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()

      const jsonStart = cleaned.indexOf("{")
      const jsonEnd = cleaned.lastIndexOf("}")

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found")
      }

      parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
    } catch {
      return NextResponse.json(
        { error: "AI ka jawab samajh nahi aaya. Dobara try karo." },
        { status: 502 }
      )
    }

    const rawRows: any[] = Array.isArray(parsed?.rows)
      ? parsed.rows
      : []

    const seen = new Set<string>()
    const rows: Record<string, string>[] = []

    for (const r of rawRows.slice(0, MAX_ROWS)) {
      const sem = Number(r?.SemesterNumber)
      const subject = String(r?.SubjectName ?? "").trim().slice(0, 120)

      const dept = (
        department || String(r?.Department ?? "")
      ).trim().slice(0, 100)

      const branch = (
        branchName || String(r?.BranchName ?? "")
      ).trim().slice(0, 100)

      if (
        !subject ||
        !dept ||
        !branch ||
        !Number.isInteger(sem) ||
        sem < 1 ||
        sem > 12
      ) {
        continue
      }

      const bCode = (
        branchCode ||
        String(r?.BranchCode ?? "") ||
        codeFrom(branch)
      )
        .trim()
        .toUpperCase()
        .slice(0, 20)

      const base =
        String(r?.SubjectCode ?? "")
          .trim()
          .toUpperCase()
          .slice(0, 20) || `${codeFrom(subject)}${sem}`

      // Same semester me duplicate subject code ko unique banao.
      let code = base
      let suffix = 2

      while (seen.has(`${bCode}|${sem}|${code}`)) {
        code = `${base}-${suffix++}`
      }

      seen.add(`${bCode}|${sem}|${code}`)

      rows.push({
        Department: dept,
        BranchName: branch,
        BranchCode: bCode,
        DurationYears: String(duration),
        SemesterNumber: String(sem),
        SubjectName: subject,
        SubjectCode: code,
      })
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Koi subject nahi mila. Text check karo ya branch/semester bharke dobara try karo.",
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ rows })
  } catch (err) {
    console.error("[ai-structure] failed:", err)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
