"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Notice = { id: number; title: string; createdAt: string }

export function NotificationBell() {
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    fetch("/api/notices")
      .then((r) => r.json())
      .then((data) => setNotices(Array.isArray(data) ? data.slice(0, 5) : []))
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notices.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {notices.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground text-center">No new notifications</div>
        ) : (
          notices.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href="/notices" className="text-sm truncate">{n.title}</Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}