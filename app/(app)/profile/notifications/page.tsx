"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, XCircle, BellRing } from "lucide-react"
import { enablePush, pushSupport, resetPush, reasonText } from "@/lib/push"
import { missingFirebaseConfig, getVapidKey, fetchFcmToken } from "@/lib/firebase-client"

type State = "ok" | "warn" | "fail"
type Check = { label: string; state: State; detail?: string }
type ServerInfo = { devices: { suffix: string; platform: string | null }[]; adminEnv: Record<string, boolean> }
type TestResult = { devices: number; success: number; failed: number; removed: number; errors: string[]; hint?: string }

function StateIcon({ state }: { state: State }) {
  if (state === "ok") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(var(--success))]" />
  if (state === "warn") return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
  return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
}

export default function NotificationSettingsPage() {
  const [checks, setChecks] = useState<Check[]>([])
  const [running, setRunning] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [test, setTest] = useState<TestResult | null>(null)

  const runChecks = useCallback(async () => {
    setRunning(true)
    const list: Check[] = []

    const missing = missingFirebaseConfig()
    const vapidOk = !!getVapidKey()
    list.push({
      label: "App configuration",
      state: missing.length === 0 && vapidOk ? "ok" : "fail",
      detail: missing.length
        ? `Vercel me missing: ${missing.join(", ")} (jodo aur redeploy karo)`
        : !vapidOk
        ? "NEXT_PUBLIC_FIREBASE_VAPID_KEY galat hai"
        : undefined,
    })

    const support = pushSupport()
    list.push({
      label: "Browser / device support",
      state: support.supported ? "ok" : "fail",
      detail: support.supported ? undefined : reasonText(support.reason),
    })

    let token: string | null = null

    if (support.supported) {
      const perm = Notification.permission
      list.push({
        label: "Permission",
        state: perm === "granted" ? "ok" : perm === "denied" ? "fail" : "warn",
        detail:
          perm === "denied"
            ? reasonText("denied")
            : perm === "default"
            ? "Abhi allow nahi kiya. 'Enable notifications' dabao."
            : undefined,
      })

      const regs = await navigator.serviceWorker.getRegistrations()
      const urls = regs.map((r) => (r.active || r.waiting || r.installing)?.scriptURL ?? "").filter(Boolean)
      const hasGood = urls.some((u) => u.endsWith("/sw.js"))
      const extra = urls.filter((u) => !u.endsWith("/sw.js"))

      list.push({
        label: "Service worker",
        state: hasGood && extra.length === 0 ? "ok" : hasGood ? "warn" : "fail",
        detail: !hasGood
          ? "Register nahi hai. 'Enable notifications' ya 'Reset & fix' dabao."
          : extra.length
          ? `Purane workers mile (${extra.length}). 'Reset & fix' dabao.`
          : undefined,
      })

      if (perm === "granted" && hasGood) {
        try {
          token = await fetchFcmToken(await navigator.serviceWorker.ready)
          list.push({ label: "Device token", state: "ok", detail: `...${token.slice(-8)}` })
        } catch (err: any) {
          list.push({ label: "Device token", state: "fail", detail: reasonText("token_failed", err?.code || err?.message) })
        }
      }
    }

    try {
      const res = await fetch("/api/notifications/test", { cache: "no-store" })
      if (res.ok) {
        const info: ServerInfo = await res.json()
        const badEnv = Object.entries(info.adminEnv).filter(([, ok]) => !ok).map(([k]) => k)

        list.push({
          label: "Server (Firebase admin)",
          state: badEnv.length ? "fail" : "ok",
          detail: badEnv.length ? `Vercel env missing ya galat: ${badEnv.join(", ")}` : undefined,
        })

        if (token) {
          const t = token
          const registered = info.devices.some((d) => t.endsWith(d.suffix))
          list.push({
            label: "This device registered on server",
            state: registered ? "ok" : "fail",
            detail: registered ? undefined : "Server ko is device ka token nahi mila. 'Reset & fix' dabao.",
          })
        }

        list.push({
          label: "Your devices",
          state: info.devices.length ? "ok" : "warn",
          detail: `${info.devices.length} device(s) registered`,
        })
      }
    } catch {}

    setChecks(list)
    setRunning(false)
  }, [])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  async function handleEnable() {
    setBusy(true)
    setMessage("")
    const r = await enablePush()
    setMessage(r.ok ? "✅ Notifications on ho gaye" : "❌ " + reasonText(r.reason, r.detail))
    setBusy(false)
    runChecks()
  }

  async function handleReset() {
    setBusy(true)
    setMessage("")
    setTest(null)
    await resetPush()
    const r = await enablePush()
    setMessage(r.ok ? "✅ Reset ho gaya aur device dobara register ho gaya" : "❌ " + reasonText(r.reason, r.detail))
    setBusy(false)
    runChecks()
  }

  async function handleTest() {
    setBusy(true)
    setMessage("")
    setTest(null)
    const res = await fetch("/api/notifications/test", { method: "POST" })
    const data = await res.json()
    if (!res.ok) setMessage("❌ " + (data.error || "Test fail hua"))
    else setTest(data)
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <BellRing className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Notification Settings</h1>
          <p className="text-xs text-muted-foreground">Class reminders, notices aur updates ki setup yahan check hoti hai</p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border bg-card p-4">
        {running ? (
          <p className="text-sm text-muted-foreground">Checking...</p>
        ) : (
          checks.map((c) => (
            <div key={c.label} className="flex gap-2.5">
              <StateIcon state={c.state} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{c.label}</p>
                {c.detail && <p className="break-words text-xs text-muted-foreground">{c.detail}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button onClick={handleEnable} disabled={busy}>Enable notifications</Button>
        <Button variant="outline" onClick={handleTest} disabled={busy}>Send test</Button>
        <Button variant="outline" onClick={handleReset} disabled={busy}>Reset & fix</Button>
      </div>

      {message && <p className="text-sm">{message}</p>}

      {test && (
        <div className="space-y-1 rounded-2xl border bg-card p-4 text-sm">
          <p className="font-semibold">Test result</p>
          <p className="text-xs text-muted-foreground">
            Devices: {test.devices} • Sent: {test.success} • Failed: {test.failed}
            {test.removed ? ` • Purane hataye: ${test.removed}` : ""}
          </p>
          {test.hint && <p className="text-xs">{test.hint}</p>}
          {test.errors.map((e) => (
            <p key={e} className="break-words text-[11px] text-red-500">{e}</p>
          ))}
        </div>
      )}

      <div className="space-y-1.5 rounded-2xl border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">Notification na dikhe to (Android):</p>
        <p>1. App ko Chrome menu se "Install app" karke install karo (sirf shortcut nahi).</p>
        <p>2. Phone Settings → Apps → Chrome/CampusHub → Battery → No restrictions, aur Autostart ON.</p>
        <p>3. Settings → Notifications me CampusHub/Chrome ke liye "App icon badges" ON (icon par number tabhi aata hai).</p>
        <p>4. iPhone: pehle Share → Add to Home Screen, phir wahan se kholo.</p>
      </div>
    </div>
  )
}