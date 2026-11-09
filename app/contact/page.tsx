import Link from "next/link"
import { CampusHubLogo } from "@/components/campushub-logo"
import { Mail, Phone, MapPin } from "lucide-react"

export const metadata = { title: "Contact Us — CampusHub" }

// 👇 Ye teeno apne asli details se badlo
const CONTACT_EMAIL = "kartikcampushub@gmail.com"
const CONTACT_PHONE = "+91 6205259696"
const CONTACT_ADDRESS = "CampusHub,Vivekananda Global university, jaipur, Rajsthan"

export default function ContactPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/" className="flex w-fit items-center gap-2">
          <CampusHubLogo className="h-7 w-7" />
          <span className="font-bold">CampusHub</span>
        </Link>

        <h1 className="text-2xl font-bold">Contact Us</h1>
        <p className="text-sm text-muted-foreground">
          Questions, bugs or payment issues? Reach out and we'll reply within 48 hours.
        </p>

        <div className="space-y-3 rounded-2xl border bg-card p-5">
          <p className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-primary" /> {CONTACT_EMAIL}</p>
          <p className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-primary" /> {CONTACT_PHONE}</p>
          <p className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-primary" /> {CONTACT_ADDRESS}</p>
        </div>
      </div>
    </main>
  )
}