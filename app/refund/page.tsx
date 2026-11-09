import Link from "next/link"
import { CampusHubLogo } from "@/components/campushub-logo"

export const metadata = { title: "Refund & Cancellation Policy — CampusHub" }

// 👇 Apna asli email yahan daalo
const CONTACT_EMAIL = "kartikcampushub@gmail.com"

const sections = [
  {
    title: "1. Free features",
    body: "Most CampusHub features (resources, notices, events, timetable, attendance, marketplace listings, food directory) are free to use. No payment is taken for them.",
  },
  {
    title: "2. Paid plans",
    body: "Premium plans and paid tests are one-time payments for a fixed period. They do not renew automatically. Access continues until the plan's end date.",
  },
  {
    title: "3. When we refund",
    body: `We refund a payment if (a) you were charged twice for the same item, or (b) money was deducted but the plan or test was not activated. Write to ${CONTACT_EMAIL} within 7 days with your registered email and payment reference. Approved refunds go back to the original payment method in 5-7 working days.`,
  },
  {
    title: "4. When we don't refund",
    body: "A plan that was successfully activated and used is not refundable.",
  },
  {
    title: "5. Marketplace, rentals, food and events",
    body: "Deals between students (buying, selling, renting) and orders placed with food vendors or event organizers happen directly between the people involved. CampusHub only lists them and is not a party to these transactions, so refunds for them must be settled with the other party.",
  },
  {
    title: "6. Contact",
    body: `For any payment query, email ${CONTACT_EMAIL}.`,
  },
]

export default function RefundPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/" className="flex w-fit items-center gap-2">
          <CampusHubLogo className="h-7 w-7" />
          <span className="font-bold">CampusHub</span>
        </Link>

        <h1 className="text-2xl font-bold">Refund & Cancellation Policy</h1>

        {sections.map((s) => (
          <section key={s.title} className="space-y-2">
            <h2 className="font-semibold">{s.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}