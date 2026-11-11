import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NotificationSettings } from "@/components/notification-settings"

export default async function NotificationSettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { role: true },
  })

  return <NotificationSettings isSuperAdmin={user?.role === "SUPER_ADMIN"} />
}