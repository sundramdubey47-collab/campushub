import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateReferralCode } from "@/lib/referral"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, referralCode } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All Fields are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is alredy exsit" },
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
    // Ensure uniqueness (bahut rare collision case handle karne ke liye)
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
      { message: "Account Create Successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Somthing went Wrong" },
      { status: 500 }
    )
  }
}