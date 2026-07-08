"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check, Users, Gift, MessageCircle } from "lucide-react"

export default function ReferralsPage() {
  const [data, setData] = useState<{ referralCode: string; totalInvited: number; successfulReferrals: number } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/referral").then((r) => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${data.referralCode}`
    : ""

  function handleCopy() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappMessage = encodeURIComponent(
    `Hey! I've been using CampusHub for notes, notices, events, and more — join using my link and we both get a reward: ${referralLink}`
  )

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title="Invite Friends"
        description="Share CampusHub with your classmates and earn rewards"
      />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Friends Invited" value={data.totalInvited} icon={Users} />
        <StatCard label="Rewards Earned" value={data.successfulReferrals} icon={Gift} />
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <p className="text-sm font-medium">Your referral link</p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm truncate">
            {referralLink}
          </div>
          <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <a href={`https://wa.me/?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-[oklch(0.55_0.13_145)] hover:opacity-90">
            <MessageCircle className="h-4 w-4 mr-2" /> Share on WhatsApp
          </Button>
        </a>
      </div>

      <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-transparent p-4 space-y-1">
        <p className="text-sm font-medium">How it works</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          When a friend signs up using your link and completes onboarding, you get a 10% discount coupon, and they get a 5% welcome coupon. No limit on how many friends you can invite!
        </p>
      </div>
    </div>
  )
}