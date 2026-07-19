import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { token, platform = "web" } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: "FCM token is required" },
        { status: 400 }
      )
    }

    const userId = Number(session.user.id)

    // Check if this token already exists
    const existing = await prisma.userDevice.findFirst({
      where: {
        fcmToken: token,
      },
    })

    if (existing) {
      await prisma.userDevice.update({
        where: {
          id: existing.id,
        },
        data: {
          userId,
          platform,
          updatedAt: new Date(),
        },
      })
    } else {
      await prisma.userDevice.create({
        data: {
          userId,
          fcmToken: token,
          platform,
        },
      })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("FCM Register Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
      },
      {
        status: 500,
      }
    )
  }
}