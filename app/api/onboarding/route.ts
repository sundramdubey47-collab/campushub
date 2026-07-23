import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function generateCouponCode() {
  return `CH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login is required" }, { status: 401 })
  }

  const body = await req.json()
  const { collegeId, departmentId, courseId, semesterId, section } = body

  if (!collegeId || !departmentId || !courseId || !semesterId) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      collegeId: Number(collegeId),
      departmentId: Number(departmentId),
      courseId: Number(courseId),
      semesterId: Number(semesterId),
      section: section || null,
    },
  })

  // If this user was referred by someone, and this is their first time completing
  // onboarding, reward both the referrer and the new user with a coupon
  if (user.referredById) {
    const alreadyRewarded = await prisma.coupon.findFirst({
      where: { ownerId: user.referredById, code: { startsWith: `REF-${user.id}-` } },
    })

    if (!alreadyRewarded) {
      // Reward the referrer
      await prisma.coupon.create({
        data: {
          code: `REF-${user.id}-${generateCouponCode()}`,
          discountPercent: 10,
          ownerId: user.referredById,
        },
      })

      // Give the new user a welcome coupon too
      await prisma.coupon.create({
        data: {
          code: generateCouponCode(),
          discountPercent: 5,
          ownerId: user.id,
        },
      })
    }
  }

  return NextResponse.json({ message: "Onboarding complete" })
}