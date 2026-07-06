"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CampusHubLogo } from "@/components/campushub-logo"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import {
  FileText, Bell, Calendar, ShoppingBag, Package, Search,
  MessageCircle, Brain, ArrowRight, Sparkles, Star, Users, Zap, Quote,
} from "lucide-react"

const features = [
  { icon: FileText, title: "Academic Resources", description: "Notes, PYQs, assignments — shared by your own seniors and classmates.", color: "oklch(0.55 0.15 278)" },
  { icon: Bell, title: "Notices", description: "Never miss an important update from your college again.", color: "oklch(0.6 0.18 25)" },
  { icon: Calendar, title: "Events", description: "Discover fests, hackathons, and workshops — register with one tap.", color: "oklch(0.72 0.15 60)" },
  { icon: ShoppingBag, title: "Marketplace", description: "Buy, sell, or exchange with students on your own campus.", color: "oklch(0.55 0.13 145)" },
  { icon: Package, title: "Rentals", description: "Rent books, laptops, and gear instead of buying them new.", color: "oklch(0.55 0.15 278)" },
  { icon: Brain, title: "AI Test Series", description: "Practice with AI-generated tests tailored to your syllabus.", color: "oklch(0.6 0.18 25)" },
  { icon: MessageCircle, title: "AI Assistant", description: "24x7 study help, career guidance, and more — always free.", color: "oklch(0.72 0.15 60)" },
  { icon: Search, title: "Lost & Found", description: "Lost something on campus? Your community has your back.", color: "oklch(0.55 0.13 145)" },
]

const stats = [
  { label: "Academic Resources", value: "10K+" },
  { label: "Active Colleges", value: "50+" },
  { label: "Student Community", value: "24x7" },
  { label: "AI-Powered", value: "100%" },
]

const testimonials = [
  { name: "Ananya S.", role: "3rd Year, CSE", quote: "Found last year's question papers in two minutes flat. This should've existed years ago." },
  { name: "Rohan M.", role: "2nd Year, ECE", quote: "Sold my old calculator and rented a DSLR for a project shoot — all on the same app." },
  { name: "Priya K.", role: "Final Year, IT", quote: "The AI assistant helped me debug an assignment at 2 AM. Genuinely a lifesaver." },
]

const faqs = [
  { q: "Is CampusHub free to use?", a: "Yes! Core features like notes, notices, events, and the AI assistant are completely free. A Premium plan unlocks unlimited downloads and exclusive test series." },
  { q: "Can students from any college join?", a: "Yes — CampusHub supports multiple universities and colleges. During signup, you'll select your own university, college, branch, and semester." },
  { q: "How does the marketplace work?", a: "You can list items to sell or exchange, chat directly with buyers, and complete the deal — all within your own verified campus community." },
  { q: "Is my data safe?", a: "Yes. Your account is tied to your college email and protected with secure authentication. We never share your personal data." },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.06 },
  }),
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <CampusHubLogo className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight">CampusHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-10 sm:pt-28 max-w-6xl mx-auto text-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[100px] -z-10" />
        <div className="absolute top-32 right-0 h-64 w-64 rounded-full bg-[oklch(0.72_0.15_60/0.15)] blur-[100px] -z-10" />

        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-6 border border-primary/20">
  <Sparkles className="h-3.5 w-3.5" /> Trusted by students across multiple universities
</span>
        </motion.div>

        <motion.h1
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]"
        >
          One Platform For<br />
          <span className="bg-gradient-to-r from-primary to-[oklch(0.55_0.15_278)] bg-clip-text text-transparent">
            Every College Student
          </span>
        </motion.h1>

        <motion.p
          initial="hidden" animate="visible" custom={2} variants={fadeUp}
          className="text-muted-foreground mt-5 max-w-xl mx-auto text-sm sm:text-lg"
        >
          Notes, notices, events, marketplace, and an AI tutor that never sleeps — everything your college life needs, built into one place.
        </motion.p>

        <motion.div
          initial="hidden" animate="visible" custom={3} variants={fadeUp}
          className="flex items-center justify-center gap-3 mt-9"
        >
          <Link href="/signup">
            <Button size="lg" className="shadow-lg shadow-primary/20">
              Join Your Campus <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Login</Button>
          </Link>
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-20 max-w-4xl mx-auto"
        >
          <div className="rounded-t-2xl border border-b-0 bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/40">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <div className="ml-3 text-[10px] text-muted-foreground bg-background rounded px-2 py-0.5 border">campushub.app/dashboard</div>
            </div>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex gap-3 mb-4">
                <div className="hidden sm:flex flex-col gap-1.5 w-32 shrink-0">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-7 rounded-lg ${i === 1 ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="rounded-xl bg-primary text-primary-foreground p-4 text-left">
                    <p className="text-[10px] opacity-70 uppercase">Your Campus</p>
                    <p className="font-bold text-sm sm:text-base">Your Campus. Your Journey.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4].map((i) => <div key={i} className="h-14 rounded-lg bg-muted" />)}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-20 rounded-lg bg-muted" />
                    <div className="h-20 rounded-lg bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
{/* How It Works */}
<section className="px-6 py-20 max-w-5xl mx-auto">
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center mb-14"
  >
    <span className="text-xs font-semibold text-primary uppercase tracking-wider">How It Works</span>
    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">Up and running in minutes</h2>
    <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-md mx-auto">
      No setup headaches — students onboard themselves, colleges stay in control
    </p>
  </motion.div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
    <div className="hidden md:block absolute top-6 left-[16.5%] right-[16.5%] h-px bg-border" />
    {[
      { step: "01", title: "Select Your College", description: "Students sign up and choose their university, college, branch, and semester." },
      { step: "02", title: "Access Everything Instantly", description: "Notes, notices, events, marketplace, and AI tools — all scoped to your own campus." },
      { step: "03", title: "College Stays in Control", description: "Admins manage users and content; faculty post notices and create tests — all from one dashboard." },
    ].map((item, i) => (
      <motion.div
        key={item.step}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1 }}
        className="relative text-center space-y-3"
      >
        <div className="relative mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10">
          {item.step}
        </div>
        <h3 className="font-semibold">{item.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
      </motion.div>
    ))}
  </div>
</section>

{/* Credibility strip */}
<section className="px-6 py-10 border-y bg-muted/20">
  <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
    {[
      "Multi-University Ready",
      "Role-Based Access Control",
      "Secure Authentication",
      "Built to Scale",
    ].map((item) => (
      <div key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {item}
      </div>
    ))}
  </div>
</section>
      {/* Stats bar */}
      <section className="px-6 py-14 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">Everything in One Place</h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-md mx-auto">
            No more juggling ten different apps for college life
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border bg-card p-5 space-y-3 hover:shadow-lg transition-shadow"
              >
                <div className="rounded-xl p-2.5 w-fit" style={{ backgroundColor: `${f.color}22` }}>
                  <Icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Why CampusHub */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto space-y-16">
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Why CampusHub</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">Built different, for a reason</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Built for Speed", description: "Find what you need in seconds — resources, events, or people. No clutter, no noise." },
              { icon: Users, title: "By Students, For Students", description: "Every feature solves a problem students actually face — because we've faced them too." },
              { icon: Star, title: "AI-Powered Learning", description: "From instant doubt-solving to auto-generated practice tests — study smarter, not harder." },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center space-y-3"
                >
                  <div className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Testimonials</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">Loved by students like you</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-6 space-y-4"
            >
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">FAQ</span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mt-2">Frequently Asked Questions</h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm font-medium text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 sm:p-16 space-y-5"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight relative">Ready to get started?</h2>
          <p className="text-sm sm:text-base opacity-85 relative">Join thousands of students already using CampusHub</p>
          <div className="relative">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="shadow-xl">
                Create Your Account <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CampusHubLogo className="h-6 w-6" />
            <span className="font-bold text-sm">CampusHub</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CampusHub. Made with ❤️ for students.</p>
        </div>
      </footer>
    </main>
  )
}