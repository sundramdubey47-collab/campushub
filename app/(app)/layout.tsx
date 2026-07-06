import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"
import { MobileNav } from "@/components/mobile-nav"
import { CampusHubLogo } from "@/components/campushub-logo"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notification-bell"
import { prisma } from "@/lib/prisma"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: {
      name: true,
      role: true,
      collegeId: true,
      course: { select: { name: true } },
      semester: { select: { number: true } },
    },
  })

  if (!dbUser?.collegeId) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - desktop only */}
      <aside className="hidden md:flex w-64 flex-col border-r shrink-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b">
          <CampusHubLogo className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">CampusHub</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="border-t p-3">
          <UserMenu
            name={dbUser?.name ?? session.user?.name ?? "Student"}
            subtitle={dbUser?.course?.name ? `${dbUser.course.name}${dbUser.semester ? " • Sem " + dbUser.semester.number : ""}` : dbUser?.role}
          />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Navbar */}
        <header className="flex h-16 items-center gap-3 border-b px-4 shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
          </div>

          <div className="hidden sm:block flex-1 max-w-md">
            <div className="relative">
              <input
                placeholder="Search resources, events, people..."
                className="w-full rounded-lg border bg-muted/40 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                readOnly
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden md:block">
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden bg-muted/20">{children}</main>
      </div>
    </div>
  )
}