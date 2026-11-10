import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendMail, emailProvider } from "@/lib/mailer"

export async function GET(req: Request) {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: { role: true, email: true },
  })

  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 })
  }

  const to = new URL(req.url).searchParams.get("to") || user.email
  const provider = emailProvider()

  try {
    await sendMail({ to, subject: "CampusHub email test", html: "<p>Email setup is working ✅</p>" })
    return NextResponse.json({ ok: true, provider, to })
  } catch (err: any) {
    return NextResponse.json({ ok: false, provider, error: err?.message ?? String(err) }, { status: 500 })
  }
}