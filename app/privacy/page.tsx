import Link from "next/link"
import { CampusHubLogo } from "@/components/campushub-logo"

export const metadata = {
  title: "Privacy Policy — CampusHub",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <CampusHubLogo className="h-7 w-7" />
          <span className="font-bold">CampusHub</span>
        </Link>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

          <section className="space-y-2">
            <h2 className="font-semibold">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information you provide directly, including your name, email address, college/university details, and any content you upload (notes, listings, messages). If you sign in with Google, we receive your name and email from Google.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">2. How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use your information to provide and improve the Platform, personalize your experience (e.g., showing resources relevant to your branch/semester), process payments, and communicate important updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">3. Data Sharing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not sell your personal data. Your name and college details may be visible to other verified students on the Platform (e.g., as the uploader of a resource, or seller in the marketplace). Payment information is processed securely by Razorpay and is not stored on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">4. Analytics</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use analytics tools (such as PostHog) to understand how the Platform is used, which helps us improve features. This data is used in aggregate and is not sold to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">5. Data Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use industry-standard security practices, including encrypted password storage, secure authentication, and rate-limiting to protect your account. However, no system is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">6. Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can update your profile information at any time. If you wish to delete your account or data, please reach out via the feedback option on the Platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">7. Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use essential cookies to keep you logged in and remember your preferences (such as dark/light mode).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">8. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. Continued use of the Platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">9. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For privacy-related questions, please reach out through the feedback option available on the Platform.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}