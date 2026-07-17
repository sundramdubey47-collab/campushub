import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieBanner } from "@/components/cookie-banner";
import Script from "next/script";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CampusHub — One Platform For Every College Student",
  description: "Notes, notices, events, marketplace, AI tutoring, and more — everything your college life needs, in one place.",
  keywords: ["campus", "college", "student", "notes", "notices", "events", "marketplace", "AI assistant"],
  manifest: "/manifest.json",
  metadataBase: new URL("https://campushub-nine-lake.vercel.app"),
  alternates: { canonical: "/" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CampusHub" },
  openGraph: {
    title: "CampusHub — One Platform For Every College Student",
    description: "Notes, notices, events, marketplace, AI tutoring, and more — everything your college life needs, in one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusHub — One Platform For Every College Student",
    description: "Notes, notices, events, marketplace, AI tutoring, and more — everything your college life needs, in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <Providers>{children}</Providers>
        <CookieBanner />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}