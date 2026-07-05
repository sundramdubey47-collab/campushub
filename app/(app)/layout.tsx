import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"
import { MobileNav } from "@/components/mobile-nav"
import { CampusHubLogo } from "@/components/campushub-logo"
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - desktop only */}
      <aside className="hidden md:flex w-60 flex-col border-r shrink-0">
        <div className="px-4 py-4 border-b">
         <CampusHubLogo className="h-7 w-7" />
<span className="text-lg font-bold">CampusHub</span>
        </div>
        <SidebarNav />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Navbar */}
        <header className="flex h-14 items-center justify-between border-b px-4 shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
            <span className="font-semibold">CampusHub</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}