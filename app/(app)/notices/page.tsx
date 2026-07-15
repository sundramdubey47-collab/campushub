import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import { NoticeCardClient } from "@/components/notice-card-client"

import {
  Bell,
  Plus,
  Sparkles,
  Megaphone,
  ShieldCheck,
  ChevronRight,
} from "lucide-react"

export default async function NoticesPage() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: {
      email: session?.user?.email ?? "",
    },
    select: {
      collegeId: true,
      departmentId: true,
      courseId: true,
      semesterId: true,
      role: true,
    },
  })

  const canManage = [
    "FACULTY",
    "ADMIN",
    "SUPER_ADMIN",
  ].includes(dbUser?.role ?? "")

  const notices = dbUser?.collegeId
    ? await prisma.notice.findMany({
        where: {
          collegeId: dbUser.collegeId,
          isArchived: false,
          publishAt: {
            lte: new Date(),
          },
          AND: [
            {
              OR: [
                { departmentId: null },
                { departmentId: dbUser.departmentId },
              ],
            },
            {
              OR: [
                { courseId: null },
                { courseId: dbUser.courseId },
              ],
            },
            {
              OR: [
                { semesterId: null },
                { semesterId: dbUser.semesterId },
              ],
            },
          ],
        },
        orderBy: [
          {
            isPinned: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        include: {
          postedBy: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      })
    : []

  const serializedNotices = notices.map((notice) => ({
    ...notice,
    createdAt: notice.createdAt.toISOString(),
  }))

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 shadow-2xl">

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute -left-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10 p-5 sm:p-8 md:p-12">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur sm:px-4 sm:text-sm">
                  <Sparkles className="h-4 w-4" />
                  Latest Campus Updates
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                  College Notices
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base sm:leading-7">
                  Stay updated with official announcements,
                  examinations, placements, circulars,
                  academic schedules and every important
                  notification from your college.
                </p>
                              </div>

              {/* Right Side */}
              <div className="w-full max-w-md space-y-4">

                <div className="grid grid-cols-2 gap-3">

                  {/* Active Notices */}
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">

                    <div className="flex items-center justify-between">

                      <div className="rounded-xl bg-white/15 p-3">
                        <Bell className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      </div>

                      <span className="text-2xl font-black text-white sm:text-3xl">
                        {serializedNotices.length}
                      </span>

                    </div>

                    <p className="mt-3 text-xs font-medium text-indigo-100 sm:text-sm">
                      Active Notices
                    </p>

                  </div>

                  {/* Manage Access */}
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">

                    <div className="flex items-center justify-between">

                      <div className="rounded-xl bg-white/15 p-3">
                        <ShieldCheck className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      </div>

                      <span className="text-2xl font-black text-white sm:text-3xl">
                        {canManage ? "YES" : "NO"}
                      </span>

                    </div>

                    <p className="mt-3 text-xs font-medium text-indigo-100 sm:text-sm">
                      Manage Access
                    </p>

                  </div>

                </div>

                {canManage && (
                  <Link href="/notices/create">
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-2xl bg-white text-indigo-700 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-indigo-50 sm:h-14"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create New Notice
                      <ChevronRight className="ml-auto h-5 w-5" />
                    </Button>
                  </Link>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* Content */}
        <div className="mt-8 sm:mt-10">

          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
                <Megaphone className="h-4 w-4" />
                Official Announcements
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Recent Notices
              </h2>

              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                All official announcements published by your college.
              </p>

            </div>

          </div>
                    {serializedNotices.length === 0 ? (

            <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-10">

              {/* Background Blobs */}
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative flex flex-col items-center text-center">

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-xl sm:mb-6 sm:h-20 sm:w-20">
                  <Bell className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                </div>

                <h3 className="text-xl font-bold sm:text-2xl">
                  No Notices Available
                </h3>

                <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Your college hasn't published any notices yet.
                  Once an announcement is released,
                  it will automatically appear here.
                </p>

                {canManage && (
                  <Link
                    href="/notices/create"
                    className="mt-7 w-full sm:mt-8 sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="w-full rounded-2xl px-8 sm:w-auto"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Publish First Notice
                    </Button>
                  </Link>
                )}

              </div>

            </div>

          ) : (

            <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-3 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-4">

              <div className="space-y-4 sm:space-y-5">
                                {serializedNotices.map((notice, index) => (
                  <div
                    key={notice.id}
                    className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-950"
                  >
                    {/* Left Gradient */}
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 via-violet-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* NEW Badge */}
                    {index < 3 && (
                      <div className="absolute right-3 top-3 z-10 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-lg sm:right-5 sm:top-5 sm:px-3 sm:text-[10px]">
                        NEW
                      </div>
                    )}

                    {/* Notice Card */}
                    <div className="relative p-2 sm:p-3">
                      <NoticeCardClient
                        notice={notice}
                        canManage={canManage}
                      />
                    </div>
                  </div>
                ))}

              </div>

            </div>

          )}
                  </div>

      </div>

    </div>
  )
}