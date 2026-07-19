import { prisma } from "@/lib/prisma"

type NotificationPayload = {
  userId: number
  title: string
  body: string
  url?: string
}

export async function sendPushNotification({
  userId,
  title,
  body,
  url = "/dashboard",
}: NotificationPayload) {
  const { adminMessaging } = await import("@/lib/firebase-admin")

  const devices = await prisma.userDevice.findMany({
    where: {
      userId,
    },
  })

  if (!devices.length) {
    console.log("No registered devices found.")
    return
  }

  const tokens = devices.map((d) => d.fcmToken)

  console.log("Sending notification to", tokens.length, "device(s)")

  const result = await adminMessaging.sendEachForMulticast({
    tokens,

    notification: {
      title,
      body,
    },

    data: {
      url,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },

    webpush: {
      headers: {
        Urgency: "high",
      },

      notification: {
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        requireInteraction: true,
      },

      fcmOptions: {
        link: url,
      },
    },
  })

  console.log(
    `Push Result: ${result.successCount} success, ${result.failureCount} failed`
  )

  // Remove invalid tokens automatically
  for (let i = 0; i < result.responses.length; i++) {
    const response = result.responses[i]

    if (
      !response.success &&
      response.error?.code ===
        "messaging/registration-token-not-registered"
    ) {
      console.log("Removing invalid token:", tokens[i])

      await prisma.userDevice.deleteMany({
        where: {
          fcmToken: tokens[i],
        },
      })
    }
  }
}

type CollegeNotificationPayload = {
  collegeId: number
  title: string
  body: string
  url?: string
}

export async function sendPushNotificationToCollege({
  collegeId,
  title,
  body,
  url = "/dashboard",
}: CollegeNotificationPayload) {
  const { adminMessaging } = await import("@/lib/firebase-admin")

  const devices = await prisma.userDevice.findMany({
    where: {
      user: {
        collegeId,
      },
    },
    include: {
      user: true,
    },
  })

  if (!devices.length) {
    console.log("No registered devices found for this college.")
    return
  }

  const tokens = [...new Set(devices.map((d) => d.fcmToken))]

  console.log(
    `Sending notification to ${tokens.length} device(s) in college ${collegeId}`
  )

  const result = await adminMessaging.sendEachForMulticast({
    tokens,

    notification: {
      title,
      body,
    },

    data: {
      url,
    },

    webpush: {
      headers: {
        Urgency: "high",
      },

      notification: {
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        requireInteraction: true,
      },

      fcmOptions: {
        link: url,
      },
    },
  })

  console.log(
    `College Push Result: ${result.successCount} success, ${result.failureCount} failed`
  )

  for (let i = 0; i < result.responses.length; i++) {
    const response = result.responses[i]

    if (
      !response.success &&
      response.error?.code ===
        "messaging/registration-token-not-registered"
    ) {
      await prisma.userDevice.deleteMany({
        where: {
          fcmToken: tokens[i],
        },
      })
    }
  }
}