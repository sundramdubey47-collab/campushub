import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { NoticeCardClient } from "@/components/notice-card-client"
import { Bell, Plus } from "lucide-react"

export default async function NoticesPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { collegeId: true, departmentId: true, courseId: true, semesterId: true, role: true },
  })

  const canManage = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser?.role ?? "")

  const notices = dbUser?.collegeId
    ? await prisma.notice.findMany({
        where: {
          collegeId: dbUser.collegeId,
          isArchived: false,
          publishAt: { lte: new Date() },
          AND: [
            { OR: [{ departmentId: null }, { departmentId: dbUser.departmentId }] },
            { OR: [{ courseId: null }, { courseId: dbUser.courseId }] },
            { OR: [{ semesterId: null }, { semesterId: dbUser.semesterId }] },
          ],
        },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: { postedBy: { select: { name: true, role: true } } },
      })
    : []

  const serializedNotices = notices.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
          <p className="text-sm text-muted-foreground">Stay updated with everything from your college</p>
        </div>
        {canManage && (
          <Link href="/notices/create">
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New Notice</Button>
          </Link>
        )}
      </div>

      {serializedNotices.length === 0 ? (
        <EmptyState
  icon={Bell}
  title="No notices yet"
  description="Notices from your college will show up here as soon as they're posted"
/> 
      ) : (
        <div className="space-y-3">
          {serializedNotices.map((notice) => (
            <NoticeCardClient key={notice.id} notice={notice} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  )
}