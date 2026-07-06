import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
const ip = req.headers.get("x-forwarded-for") ?? "unknown"
const allowed = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000) // 5 signups per hour per IP

if (!allowed) {
  return NextResponse.json(
    { error: "Too many signup attempts. Please try again later." },
    { status: 429 }
  )
}  
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill all the fildes" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already exist" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
      },
    })

    return NextResponse.json(
      { message: "Successfully Created Account", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Somthing Went Wrong" },
      { status: 500 }
    )
  }
}