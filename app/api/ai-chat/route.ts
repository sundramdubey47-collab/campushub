import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getAIResponse } from "@/lib/ai-provider"

const DAILY_MESSAGE_LIMIT = 20

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Login karna zaroori hai" }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      college: { select: { name: true } },
      department: { select: { name: true } },
      course: { select: { name: true } },
      semester: { select: { number: true } },
    },
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User nahi mila" }, { status: 400 })
  }

  // Rate limiting - aaj kitne messages bheje
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayMessageCount = await prisma.aiMessage.count({
    where: {
      role: "USER",
      createdAt: { gte: todayStart },
      session: { userId: dbUser.id },
    },
  })

  if (todayMessageCount >= DAILY_MESSAGE_LIMIT) {
    return NextResponse.json(
      { error: `Aaj ka limit (${DAILY_MESSAGE_LIMIT} messages) khatam ho gaya, kal try karo` },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { sessionId, message } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message khaali nahi ho sakta" }, { status: 400 })
  }

  // Session banao ya existing use karo
  let chatSession
  if (sessionId) {
    chatSession = await prisma.chatSession.findUnique({ where: { id: Number(sessionId) } })
    if (!chatSession || chatSession.userId !== dbUser.id) {
      return NextResponse.json({ error: "Session nahi mila" }, { status: 404 })
    }
  } else {
    chatSession = await prisma.chatSession.create({
      data: { userId: dbUser.id, title: message.slice(0, 50) },
    })
  }

  // User ka message save karo
  await prisma.aiMessage.create({
    data: { sessionId: chatSession.id, role: "USER", content: message },
  })

  // Purani history laao (context ke liye)
  const history = await prisma.aiMessage.findMany({
    where: { sessionId: chatSession.id },
    orderBy: { createdAt: "asc" },
    take: 20, // sirf last 20 messages, taaki cost control rahe
  })

  const systemPrompt = `Tum CampusHub ke AI Campus Assistant ho — ek helpful study mentor aur campus guide.

Student ki details:
- Naam: ${dbUser.name}
- College: ${dbUser.college?.name || "N/A"}
- Department: ${dbUser.department?.name || "N/A"}
- Course: ${dbUser.course?.name || "N/A"}
- Semester: ${dbUser.semester?.number || "N/A"}

Tumhara kaam hai: academic questions ka jawab dena, concepts simple bhasha me samjhana, study plans banana, coding help karna, career guidance dena, aur CampusHub ke features ke baare me batana. Jawab clear aur helpful rakho. Plagiarism ko promote mat karo.`

  const aiResponse = await getAIResponse(
    history.map((m) => ({ role: m.role.toLowerCase() as "user" | "assistant", content: m.content })),
    systemPrompt
  )

  await prisma.aiMessage.create({
    data: { sessionId: chatSession.id, role: "ASSISTANT", content: aiResponse },
  })

  return NextResponse.json({ sessionId: chatSession.id, reply: aiResponse })
}