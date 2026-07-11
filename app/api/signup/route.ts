import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateReferralCode } from "@/lib/referral"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { signupSchema, formatZodError } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const result = checkRateLimit(`signup:${ip}`, RATE_LIMITS.AUTH_STRICT)

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((result.retryAfterMs ?? 0) / 1000)) } }
      )
    }

    const body = await req.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }

    const { name, email, password, referralCode } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    let referredById: number | null = null
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (referrer) referredById = referrer.id
    }

    const passwordHash = await bcrypt.hash(password, 10)

    let myReferralCode = generateReferralCode()
    while (await prisma.user.findUnique({ where: { referralCode: myReferralCode } })) {
      myReferralCode = generateReferralCode()
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
        referralCode: myReferralCode,
        referredById,
      },
    })

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("[signup] Internal error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}