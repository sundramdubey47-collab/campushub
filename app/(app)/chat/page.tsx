"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { MessageCircle, Send, Pencil, Trash2, X, Reply } from "lucide-react"

type Message = {
  id: number
  content: string
  createdAt: string
  isEdited?: boolean
  isDeleted?: boolean
  pending?: boolean
  failed?: boolean
  user: { id: number; name: string }
  replyTo?: { id: number; content: string; user: { name: string } } | null
}

function sortMessages(list: Message[]) {
  return [...list].sort((a, b) => {
    if (a.pending && b.pending) return b.id - a.id
    if (a.pending) return 1
    if (b.pending) return -1
    return a.id - b.id
  })
}

function mergeMessages(prev: Message[], incoming: Message[]) {
  const map = new Map<number, Message>()
  prev.forEach((m) => map.set(m.id, m))
  incoming.forEach((m) => map.set(m.id, m))
  return sortMessages([...map.values()])
}

export default function CampusChatPage() {
  const { data: session } = useSession()
  const myId = String((session?.user as any)?.id ?? "")

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const lastId = useRef(0)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const swipeStart = useRef<{ x: number; id: number } | null>(null)

  const fullRefresh = useCallback(async () => {
    try {
      const res = await fetch("/api/campus-chat", { cache: "no-store" })
      if (!res.ok) return
      const fresh: Message[] = await res.json()
      setMessages((prev) => sortMessages([...fresh, ...prev.filter((m) => m.pending || m.failed)]))
      lastId.current = fresh.reduce((max, m) => Math.max(max, m.id), 0)
    } catch {}
  }, [])

  const fetchNew = useCallback(async () => {
    try {
      const res = await fetch(`/api/campus-chat?after=${lastId.current}`, { cache: "no-store" })
      if (!res.ok) return
      const fresh: Message[] = await res.json()
      if (fresh.length === 0) return
      lastId.current = fresh.reduce((max, m) => Math.max(max, m.id), lastId.current)
      setMessages((prev) => mergeMessages(prev, fresh))
    } catch {}
  }, [])

  useEffect(() => {
    fullRefresh()

    const fast = setInterval(() => {
      if (document.visibilityState === "visible") fetchNew()
    }, 3000)
    // Doosron ke edit/delete sync karne ke liye
    const slow = setInterval(() => {
      if (document.visibilityState === "visible") fullRefresh()
    }, 20000)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNew()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      clearInterval(fast)
      clearInterval(slow)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [fullRefresh, fetchNew])

  useEffect(() => {
    if (nearBottom.current) bottomRef.current?.scrollIntoView({ behavior: "auto" })
  }, [messages.length])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  async function sendText(text: string, replyTo: Message | null) {
    const tempId = -Date.now()
    const optimistic: Message = {
      id: tempId,
      content: text,
      createdAt: new Date().toISOString(),
      pending: true,
      user: { id: Number(myId), name: session?.user?.name ?? "You" },
      replyTo: replyTo ? { id: replyTo.id, content: replyTo.content, user: { name: replyTo.user.name } } : null,
    }

    nearBottom.current = true
    setMessages((prev) => sortMessages([...prev, optimistic]))

    try {
      const res = await fetch("/api/campus-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, replyToId: replyTo?.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not send")

      lastId.current = Math.max(lastId.current, data.id)
      setMessages((prev) => {
        const rest = prev.filter((m) => m.id !== tempId)
        return rest.some((m) => m.id === data.id) ? rest : sortMessages([...rest, data])
      })
    } catch (err: any) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)))
      setError(err.message || "Could not send")
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setError("")

    if (editingId) {
      const id = editingId
      const original = messages.find((m) => m.id === id)
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: text, isEdited: true } : m)))
      setEditingId(null)
      setInput("")

      const res = await fetch(`/api/campus-chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Could not edit message")
        if (original) setMessages((prev) => prev.map((m) => (m.id === id ? original : m)))
      }
      return
    }

    const target = replyingTo
    setInput("")
    setReplyingTo(null)
    await sendText(text, target)
  }

  function retry(m: Message) {
    setMessages((prev) => prev.filter((x) => x.id !== m.id))
    sendText(m.content, null)
  }

  function startPress(m: Message) {
    if (m.pending || m.failed) return
    pressTimer.current = setTimeout(() => setActiveMenuId(m.id), 450)
  }

  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  function onTouchStart(e: React.TouchEvent, m: Message) {
    swipeStart.current = { x: e.touches[0].clientX, id: m.id }
  }

  function onTouchEnd(e: React.TouchEvent, m: Message) {
    const s = swipeStart.current
    swipeStart.current = null
    if (!s || s.id !== m.id || m.pending || m.failed) return
    if (s.x - e.changedTouches[0].clientX > 50) setReplyingTo(m)
  }

  function startEdit(m: Message) {
    setEditingId(m.id)
    setReplyingTo(null)
    setInput(m.content)
    setActiveMenuId(null)
  }

  async function deleteMessage(id: number) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isDeleted: true, content: "" } : m)))
    setActiveMenuId(null)
    await fetch(`/api/campus-chat/${id}`, { method: "DELETE" })
  }

  async function blockUser(userId: number) {
    setActiveMenuId(null)
    await fetch("/api/block-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    })
    fullRefresh()
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] max-w-2xl flex-col pb-16">
      <PageHeader title="Campus Chat" description="Chat with everyone from your college" />

      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}

      <div onScroll={handleScroll} className="flex-1 space-y-2 overflow-y-auto rounded-xl border bg-card p-4">
        {messages.length === 0 ? (
          <p className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
            No messages yet. Say hi to your campus!
          </p>
        ) : (
          messages.map((m) => {
            const isMe = String(m.user.id) === myId

            if (m.isDeleted) {
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] rounded-lg bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground">
                    Message deleted
                  </div>
                </div>
              )
            }

            return (
              <div key={m.id} className={`relative flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] select-none rounded-lg px-3 py-1.5 ${
                    isMe ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                  } ${m.pending ? "opacity-70" : ""} ${m.failed ? "ring-1 ring-red-500" : ""}`}
                  onPointerDown={() => startPress(m)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onTouchStart={(e) => onTouchStart(e, m)}
                  onTouchEnd={(e) => onTouchEnd(e, m)}
                >
                  {!isMe && (
                    <p className="mb-0.5 text-[11px] font-semibold" style={{ color: "oklch(0.55 0.15 278)" }}>
                      {m.user.name}
                    </p>
                  )}

                  {m.replyTo && (
                    <div className={`mb-1 rounded border-l-2 px-2 py-1 text-[11px] ${isMe ? "border-white/40 bg-white/10" : "border-primary/40 bg-background/50"}`}>
                      <p className="font-semibold">{m.replyTo.user.name}</p>
                      <p className="truncate opacity-80">{m.replyTo.content}</p>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>

                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    {m.isEdited && <span className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>edited</span>}
                    {m.failed ? (
                      <button type="button" onClick={() => retry(m)} className="text-[10px] font-semibold text-red-200 underline">
                        Not sent. Tap to retry
                      </button>
                    ) : (
                      <span className={`text-[9px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {m.pending
                          ? "Sending..."
                          : new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                    )}
                  </div>
                </div>

                {activeMenuId === m.id && (
                  <div className={`absolute -top-9 z-10 flex gap-1 rounded-lg border bg-card p-1 shadow-lg ${isMe ? "right-0" : "left-0"}`}>
                    <button type="button" onClick={() => { setReplyingTo(m); setActiveMenuId(null) }} className="rounded p-1.5 hover:bg-muted">
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                    {isMe ? (
                      <>
                        <button type="button" onClick={() => startEdit(m)} className="rounded p-1.5 hover:bg-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => deleteMessage(m.id)} className="rounded p-1.5 text-red-500 hover:bg-muted">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => blockUser(m.user.id)} className="rounded px-2 py-1.5 text-xs text-red-500 hover:bg-muted">
                        Block
                      </button>
                    )}
                    <button type="button" onClick={() => setActiveMenuId(null)} className="rounded p-1.5 hover:bg-muted">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {(editingId || replyingTo) && (
        <div className="mt-3 flex items-center justify-between rounded-t-lg bg-muted/50 px-3 py-1.5 text-xs">
          <span className="truncate">{editingId ? "Editing message" : `Replying to ${replyingTo?.user.name}`}</span>
          <button type="button" onClick={() => { setEditingId(null); setReplyingTo(null); setInput("") }}>
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className={`flex gap-2 ${editingId || replyingTo ? "" : "mt-3"}`}>
        <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} className="h-10" />
        <Button type="submit" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}