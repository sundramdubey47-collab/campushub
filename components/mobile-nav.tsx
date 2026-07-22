"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav } from "@/components/sidebar-nav"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 flex flex-col h-full">
        <div className="px-4 py-4 border-b shrink-0">
          <span className="text-lg font-bold">CampusHub</span>
        </div>
        <div className="flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
          <SidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  )
}