"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"
import { PostHogProvider } from "./posthog-provider"
import NotificationProvider from "@/components/notification-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Firebase Push Notifications */}
          <NotificationProvider />

          {/* Rest of the App */}
          {children}
        </ThemeProvider>
      </PostHogProvider>
    </SessionProvider>
  )
}