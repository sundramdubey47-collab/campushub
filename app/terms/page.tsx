import Link from "next/link"
import { CampusHubLogo } from "@/components/campushub-logo"

export const metadata = {
  title: "Terms of Service — CampusHub",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <CampusHubLogo className="h-7 w-7" />
          <span className="font-bold">CampusHub</span>
        </Link>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

          <section className="space-y-2">
            <h2 className="font-semibold">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing or using CampusHub ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">2. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CampusHub is intended for use by students, faculty, and staff of registered educational institutions. You must provide accurate information during signup and onboarding.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">3. User Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are solely responsible for the content you upload (notes, listings, comments, etc.). You must not upload content that infringes copyright, is defamatory, obscene, or violates any law. CampusHub reserves the right to remove any content that violates these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">4. Marketplace & Rentals</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CampusHub facilitates transactions between students (buying, selling, renting) but is not a party to these transactions. We are not responsible for the quality, safety, or legality of items listed, or the ability of users to complete transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">5. Payments & Subscriptions</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium subscriptions and paid test series are processed via Razorpay. All payments are subject to Razorpay's terms. Subscription fees are non-refundable except as required by law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">6. Account Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or misuse the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">7. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CampusHub is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">8. Changes to Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">9. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For questions about these Terms, please reach out through the feedback option available on the Platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}