import nodemailer from "nodemailer"
import { resend } from "@/lib/resend"

type Mail = { to: string; subject: string; html: string }

export async function sendMail({ to, subject, html }: Mail) {
  // 1) Verified domain wala Resend (best option)
  if (process.env.RESEND_FROM) {
    const { error } = await resend.emails.send({ from: process.env.RESEND_FROM, to, subject, html })
    if (error) throw new Error(error.message)
    return
  }

  // 2) Gmail SMTP (jab tak domain nahi hai)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 465
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({ from: `CampusHub <${process.env.SMTP_USER}>`, to, subject, html })
    return
  }

  throw new Error("No email provider configured")
}