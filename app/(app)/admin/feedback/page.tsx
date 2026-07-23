import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { MessageSquare } from "lucide-react"

export default async function AdminFeedbackPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } })

  if (!dbUser || !["ADMIN", "SUPER_ADMIN"].includes(dbUser.role)) {
    return <p className="text-red-500 text-sm">Permission denied</p>
  }

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 100,
  })

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Feedback Inbox" description="See what students are saying about the app" />

      {feedbacks.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No feedback yet" />
      ) : (
        <div className="space-y-2">
          {feedbacks.map((f) => (
            <div key={f.id} className="rounded-xl border bg-card p-4 space-y-1">
              <p className="text-sm">{f.message}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                <span>{f.user.name} ({f.user.email})</span>
                <span>{f.page} • {new Date(f.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}