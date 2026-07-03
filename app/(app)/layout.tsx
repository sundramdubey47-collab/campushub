import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"

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
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r">
        <div className="px-4 py-4 border-b">
          <span className="text-lg font-bold">CampusHub</span>
        </div>
        <SidebarNav />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <header className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-semibold md:hidden">CampusHub</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}