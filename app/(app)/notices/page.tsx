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
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

   

    <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8">

      {/* ================= HERO ================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 shadow-2xl">

        <div  />

        <div  />
        <div  />

        <div className="relative z-10 p-6 md:p-10">

          <div className="flex flex-col gap-8 lg:flex-row">

            {/* LEFT */}

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">

                ✨ CampusHub Official

              </div>

              <h1 className="mt-6 text-4xl font-black text-white md:text-5xl">

                College Notices

              </h1>

              <p className="mt-5 max-w-xl text-indigo-100 leading-7">

                Never miss important announcements, placements,
                exams, holidays, workshops and academic updates.

              </p>

            </div>

            {/* RIGHT */}

            <div className="w-full max-w-md space-y-4">


              {canManage && (

                <Link href="/notices/create">

                  <Button
                    size="lg"
                    className="h-14 w-full rounded-2xl bg-white text-indigo-700 shadow-xl hover:bg-indigo-50"
                  >
                    <Plus className="mr-2 h-5 w-5" />

                    Create Notice

                  </Button>

                </Link>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* ================= SECTION HEADER ================= */}

      <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <div className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">

            📢 Official Announcements

          </div>

          <h2 className="mt-3 text-3xl font-bold">

            Latest Notices

          </h2>

          <p className="mt-2 text-muted-foreground">

            Stay updated with everything happening in your college.

          </p>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="mt-8">

        {serializedNotices.length === 0 ? (

          <div className="rounded-3xl ">

            <EmptyState
              icon={Bell}
              title="No notices available"
              description="New notices published by your college will appear here."
            />

          </div>

        ) : (

          <div className="space-y-6">

            {serializedNotices.map((notice, index) => {

              const isNew =
                Date.now() -
                  new Date(notice.createdAt).getTime() <
                1000 * 60 * 60 * 24

              return (

                <div
                  key={notice.id}
                  className={`group relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-950 ${
                    notice.isPinned
                      ? "border-yellow-400"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >

                  {/* Gradient Border */}

                  

                  {/* NEW Badge */}

                  {isNew && (

                    <div className="absolute right-5 top-5 z-20 rounded-full bg-gradient-to-r from-pink-500 to-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">

                      NEW

                    </div>

                  )}

                  {/* PINNED */}

                  {notice.isPinned && (

                    <div className="absolute left-5 top-5 z-20 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow">

                      📌 PINNED

                    </div>

                  )}

                  <div className="p-3">

                    <NoticeCardClient
                      notice={notice}
                      canManage={canManage}
                    />

                  </div>

                </div>

              )

            })}

          </div>

        )}

      </div>

    </div>

  </div>
)
}