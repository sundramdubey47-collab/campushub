import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "CampusHub — One Platform For Every College Student",
  description: "Notes, notices, events, marketplace, AI tutoring, and more — everything your college life needs, in one place.",
  keywords: ["campus", "college", "student", "notes", "notices", "events", "marketplace", "AI assistant"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CampusHub",
  },
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

export const viewport = {
  themeColor: "#3730a3",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
<Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}