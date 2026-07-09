"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { ReportButton } from "@/components/report-button"
import { Search, Plus, Phone, MapPin, Gift, CheckCircle2 } from "lucide-react"

type Item = {
  id: number
  type: string
  title: string
  description: string | null
  imageUrl: string | null
  location: string | null
  contactNumber: string | null
  reward: string | null
  createdAt: string
  reportedBy: { id: number; name: string }
}

export function LostFoundClient({ initialItems, currentUserId }: { initialItems: Item[]; currentUserId: string }) {
  const [items, setItems] = useState<Item[]>(initialItems)

  async function handleResolve(id: number) {
    await fetch(`/api/lost-found/${id}/resolve`, { method: "POST" })
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lost & Found"
        description="Lost something on campus? Or found something? Help reunite it with its owner"
        action={
          <Link href="/lost-found/report">
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Report Item</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing reported yet"
          description="No lost or found items right now — hopefully everyone has everything they need!"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-xl border bg-card overflow-hidden shadow-sm"
            >
              {item.imageUrl && (
                <div className="aspect-video bg-muted overflow-hidden flex items-center justify-center">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-sm">{item.title}</h2>
                  <span
                    className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      item.type === "LOST"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-[oklch(var(--success)/0.15)] text-[oklch(var(--success))]"
                    }`}
                  >
                    {item.type === "LOST" ? "Lost" : "Found"}
                  </span>
                </div>

                {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}

                <div className="space-y-1 text-xs text-muted-foreground">
                  {item.location && (
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> {item.location}</p>
                  )}
                  {item.contactNumber && (
                    <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" /> {item.contactNumber}</p>
                  )}
                  {item.reward && (
                    <p className="flex items-center gap-1.5 text-[oklch(var(--success))]">
                      <Gift className="h-3.5 w-3.5 shrink-0" /> Reward: {item.reward}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground pt-1 border-t">Reported by {item.reportedBy.name}</p>

                <ReportButton type="LOST_FOUND_ITEM" targetId={item.id} />

                {item.reportedBy.id.toString() === currentUserId && (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleResolve(item.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark as Resolved
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}