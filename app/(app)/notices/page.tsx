import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Bell, Plus, Megaphone, Pin, Info, AlertCircle, ChevronRight, Calendar } from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pinned: { label: "Pinned", className: "bg-primary/10 text-primary" },
  important: { label: "Important", className: "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]" },
  general: { label: "General", className: "bg-[oklch(0.72_0.15_60/0.15)] text-[oklch(0.5_0.15_60)]" },
}

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
      })
    : []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-0">

        {/* ================= HERO ================= */}
        <div className="relative overflow-hidden rounded-2xl border shadow-sm">
          <div
            className="h-48 sm:h-60 lg:h-72 bg-cover bg-center relative"
            style={{ backgroundImage: "url('/image/campus.jpg')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />

            <div className="relative z-10 flex h-full items-end">
              <div className="w-full p-6 lg:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Official Notice Board
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  College Notices
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
                  Stay updated with important announcements and official communications from your institution.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= INFO STRIP ================= */}
        <div className="mt-5 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Official Notice Board</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  View official announcements, exam schedules, circulars, and institutional updates.
                </p>
              </div>
            </div>
            {canManage && (
              <Link href="/notices/create">
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Notice</Button>
              </Link>
            )}
          </div>
        </div>
        <div className="mt-6">
          {notices.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No notices available"
              description="Official notices published by your institution will appear here."
            />
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => {
                const noticeNumber = `CH/NTC/${new Date(notice.createdAt).getFullYear()}/${String(notice.id).padStart(4, "0")}`
                const badge = notice.isPinned ? STATUS_STYLES.pinned : STATUS_STYLES.general
                const Icon = notice.isPinned ? Pin : Info

                return (
                  <Link key={notice.id} href={`/notices/${notice.id}`}>
                    <div className="rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="rounded-full bg-muted p-2 shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm">{notice.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">Ref. No. {noticeNumber}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <span className="text-xs font-medium text-primary flex items-center gap-0.5">
                          View Details <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}