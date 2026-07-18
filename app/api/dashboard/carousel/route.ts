import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { collegeId: true },
  })

  if (!dbUser?.collegeId) return NextResponse.json([])

  const [latestEvent, latestNotice, latestNote] = await Promise.all([
    prisma.event.findFirst({
      where: { collegeId: dbUser.collegeId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, description: true, eventDate: true, venue: true },
    }),
    prisma.notice.findFirst({
      where: { collegeId: dbUser.collegeId, isArchived: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, content: true },
    }),
    prisma.note.findFirst({
      where: { university: { colleges: { some: { id: dbUser.collegeId } } } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, category: true },
    }),
  ])

  const slides = []

  slides.push({
    type: "welcome",
    title: "Your Campus. Your Journey.",
    subtitle: "Explore. Learn. Connect.",
  })

  if (latestEvent) {
    slides.push({
      type: "event",
      title: latestEvent.title,
      subtitle: latestEvent.venue ?? "New Event",
      description: latestEvent.description,
      link: "/events",
      date: latestEvent.eventDate,
    })
  }

  if (latestNotice) {
    slides.push({
      type: "notice",
      title: latestNotice.title,
      subtitle: "Latest Notice",
      description: latestNotice.content,
      link: "/notices",
    })
  }

  if (latestNote) {
    slides.push({
      type: "resource",
      title: latestNote.title,
      subtitle: `New ${latestNote.category.replace(/_/g, " ")}`,
      link: `/notes/${latestNote.id}`,
    })
  }

  slides.push({
    type: "ai",
    title: "Meet Your AI Study Buddy",
    subtitle: "Available 24x7, always free",
    link: "/ai-assistant",
  })

  return NextResponse.json(slides)
}