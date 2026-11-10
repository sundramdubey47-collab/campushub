import nodemailer from "nodemailer"

type Mail = { to: string; subject: string; html: string }

export function emailProvider(): "resend" | "smtp" | "none" {
  if (process.env.RESEND_FROM && process.env.RESEND_API_KEY) return "resend"
  if (process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp"
  return "none"
}

export async function sendMail({ to, subject, html }: Mail) {
  const provider = emailProvider()

  if (provider === "resend") {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({ from: process.env.RESEND_FROM!, to, subject, html })
    if (error) throw new Error(`Resend: ${error.message}`)
    return
  }

  if (provider === "smtp") {
    const port = Number(process.env.SMTP_PORT) || 465
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: {
        user: (process.env.SMTP_USER || "").trim(),
        pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })

    await transporter.sendMail({
      from: `CampusHub <${(process.env.SMTP_USER || "").trim()}>`,
      to,
      subject,
      html,
    })
    return
  }

  throw new Error("No email provider configured (set SMTP_USER + SMTP_PASS, or RESEND_FROM + RESEND_API_KEY)")
}