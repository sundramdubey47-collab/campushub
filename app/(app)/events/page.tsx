import Link from "next/link"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { EventCardClient } from "@/components/event-card-client"

import {
  Calendar,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export default async function EventsPage() {
  const session = await auth()

  const dbUser = await prisma.user.findUnique({
    where: {
      email: session?.user?.email ?? "",
    },
    select: {
      collegeId: true,
      role: true,
    },
  })

  const canCreate =
    ["FACULTY", "ADMIN", "SUPER_ADMIN"].includes(
      dbUser?.role ?? ""
    )

  const events = dbUser?.collegeId
    ? await prisma.event.findMany({
        where: {
          collegeId: dbUser.collegeId,
        },
        orderBy: {
          eventDate: "asc",
        },
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      })
    : []

  const serializedEvents = events.map((e) => ({
    ...e,
    eventDate: e.eventDate.toISOString(),
    registrationDeadline:
      e.registrationDeadline?.toISOString() ?? null,
  }))

  return (
    <div className="space-y-8">

  {/* Hero Header */}

  <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-background to-background">

    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

    <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">

      <div className="flex items-start gap-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Calendar className="h-8 w-8" />
        </div>

        <div className="space-y-2">

          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Campus Events
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Discover College Events
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Explore fests, workshops, hackathons, seminars, competitions and
            every exciting event happening across your campus.
          </p>

        </div>

      </div>

      {canCreate && (
        <Link href="/events/create">
          <Button
            size="lg"
            className="gap-2 rounded-xl shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      )}

    </div>

  </div>

  {/* Event Count */}

  <div className="flex items-center justify-between rounded-2xl border bg-card px-6 py-4">

    <div>

      <h2 className="font-semibold">
        Upcoming Events
      </h2>

      <p className="text-sm text-muted-foreground">
        {serializedEvents.length} event{serializedEvents.length !== 1 && "s"} available
      </p>

    </div>

    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
      <ArrowRight className="h-5 w-5 text-primary" />
    </div>

  </div>
    {serializedEvents.length === 0 ? (
    <div className="rounded-3xl border bg-card p-10">
      <EmptyState
        icon={Calendar}
        title="No events yet"
        description="Exciting things are coming to your campus. Check back soon or create the first event."
      />
    </div>
  ) : (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            All Events
          </h2>

          <p className="text-sm text-muted-foreground">
            Browse upcoming activities happening in your college.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {serializedEvents.map((event) => (
          <EventCardClient
            key={event.id}
            event={event}
            canManage={canCreate}
          />
        ))}
      </div>

    </div>
  )}

</div>
)
}