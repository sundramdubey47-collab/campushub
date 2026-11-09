"use client"

import { useEffect, useState } from "react"
import { Download, Share, MoreVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallAppButton({ className = "" }: { className?: string }) {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true
    if (standalone) setInstalled(true)

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (installed) return null

  async function handleClick() {
    if (playStoreUrl) {
      window.open(playStoreUrl, "_blank", "noopener,noreferrer")
      return
    }

    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === "accepted") setInstalled(true)
      setDeferred(null)
      return
    }

    setShowHelp(true)
  }

  return (
    <>
      <Button size="sm" variant="outline" className={className} onClick={handleClick}>
        <Download className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Download App</span>
        <span className="sm:hidden">App</span>
      </Button>

      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setShowHelp(false)}>
          <div className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Install CampusHub</h2>
              <button type="button" onClick={() => setShowHelp(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Share className="h-4 w-4 shrink-0" /> Safari me neeche <b>Share</b> button dabao</li>
                <li>Phir <b>Add to Home Screen</b> chuno</li>
                <li>Top-right me <b>Add</b> dabao. Ho gaya!</li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><MoreVertical className="h-4 w-4 shrink-0" /> Chrome ke top-right me <b>3 dots</b> dabao</li>
                <li>Phir <b>Install app</b> ya <b>Add to Home screen</b> chuno</li>
                <li>Confirm karo. App home screen par aa jaayegi.</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}