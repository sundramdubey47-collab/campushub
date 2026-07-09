import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { EventCardClient } from "@/components/event-card-client"
import { Calendar, Plus } from "lucide-react"

export default async function EventsPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { collegeId: true, role: true },
  })

  const canCreate = ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(dbUser?.role ?? "")

  const events = dbUser?.collegeId
    ? await prisma.event.findMany({
        where: { collegeId: dbUser.collegeId },
        orderBy: { eventDate: "asc" },
        include: {
          createdBy: { select: { name: true } },
          _count: { select: { registrations: true } },
        },
      })
    : []

  // Dates ko JSON-safe string me convert karna zaroori hai
  const serializedEvents = events.map((e) => ({
    ...e,
    eventDate: e.eventDate.toISOString(),
    registrationDeadline: e.registrationDeadline?.toISOString() ?? null,
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">Fests, hackathons, workshops & more — never miss what's happening on campus</p>
        </div>
        {canCreate && (
          <Link href="/events/create">
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Event</Button>
          </Link>
        )}
      </div>

      {serializedEvents.length === 0 ? (
        <EmptyState icon={Calendar} title="No events yet" description="Exciting things are coming — check back soon or be the first to create one" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serializedEvents.map((event) => (
            <EventCardClient key={event.id} event={event} canManage={canCreate} />
          ))}
        </div>
      )}
    </div>
  )
}