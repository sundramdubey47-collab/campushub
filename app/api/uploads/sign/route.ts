import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// Sirf ye folders allowed hain, aur har folder me sirf ye file types
const FOLDERS = {
  "campushub-notes": "pdf,jpg,jpeg,png",
} as const

type Folder = keyof typeof FOLDERS

export async function POST(req: Request) {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "Login is required" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, collegeId: true } })
  if (!user?.collegeId) return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 })

  const rate = checkRateLimit(`upload-sign:${user.id}`, RATE_LIMITS.AUTHENTICATED_LOOSE)
  if (!rate.allowed) return NextResponse.json({ error: "Too many uploads. Please wait a bit." }, { status: 429 })

  const body = await req.json().catch(() => ({}))
  const folder = body.folder as Folder
  if (!(folder in FOLDERS)) return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 })

  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json({ error: "Upload is not configured" }, { status: 500 })
  }

  const timestamp = Math.round(Date.now() / 1000)
  const allowedFormats = FOLDERS[folder]
  const signature = cloudinary.utils.api_sign_request({ allowed_formats: allowedFormats, folder, timestamp }, apiSecret)

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder, allowedFormats })
}