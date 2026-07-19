import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { sendPushNotification } from "@/lib/notification-service"

export async function GET() {
  console.log("TEST NOTIFICATION API HIT");
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  await sendPushNotification({
    
    userId: Number(session.user.id),
    title: "🎉 CampusHub",
    body: "Congratulations! Firebase Push Notification is working.",
    url: "/dashboard",
  })

  return NextResponse.json({
    success: true,
  })
}