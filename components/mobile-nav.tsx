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
      <SheetContent side="left" className="w-64 p-0">
        <div className="px-4 py-4 border-b">
          <span className="text-lg font-bold">CampusHub</span>
        </div>
        <div onClick={() => setOpen(false)}>
          <SidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  )
}