"use client"

import { useEffect, useRef, useState } from "react"
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
  user: { id: number; name: string }
  replyTo?: { id: number; content: string; user: { name: string } } | null
}

export default function CampusChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)
  const swipeStart = useRef<{ x: number; id: number } | null>(null)

  async function load() {
    const res = await fetch("/api/campus-chat")
    const data = await res.json()
    setMessages(data)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    setError("")
    setSending(true)

    if (editingId) {
      const res = await fetch(`/api/campus-chat/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      })
      const data = await res.json()
      setSending(false)
      if (!res.ok) { setError(data.error); return }
      setMessages((prev) => prev.map((m) => (m.id === editingId ? data : m)))
      setEditingId(null)
      setInput("")
      return
    }

    const res = await fetch("/api/campus-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, replyToId: replyingTo?.id }),
    })

    const data = await res.json()
    setSending(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setInput("")
    setReplyingTo(null)
    setMessages((prev) => [...prev, data])
  }

  function startPress(msg: Message) {
    pressTimer.current = setTimeout(() => setActiveMenuId(msg.id), 500)
  }

  function cancelPress() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  function startEdit(msg: Message) {
    setEditingId(msg.id)
    setInput(msg.content)
    setActiveMenuId(null)
  }

  async function deleteMessage(id: number) {
    await fetch(`/api/campus-chat/${id}`, { method: "DELETE" })
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isDeleted: true, content: "" } : m)))
    setActiveMenuId(null)
  }

  async function blockUser(userId: number) {
    await fetch("/api/block-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId }),
    })
    setActiveMenuId(null)
  }

  // Swipe-to-reply (WhatsApp jaisa — left swipe)
  function handleTouchStart(e: React.TouchEvent, msg: Message) {
    swipeStart.current = { x: e.touches[0].clientX, id: msg.id }
  }

  function handleTouchEnd(e: React.ChangeEvent<any> | React.TouchEvent, msg: Message) {
    if (!swipeStart.current || swipeStart.current.id !== msg.id) return
    const endX = (e as React.TouchEvent).changedTouches?.[0]?.clientX ?? swipeStart.current.x
    const diff = swipeStart.current.x - endX
    if (diff > 50) {
      setReplyingTo(msg)
    }
    swipeStart.current = null
  }

  const myId = (session?.user as any)?.id

  return (
    <div className="max-w-2xl h-[calc(100vh-8rem)] flex flex-col pb-16">
      <PageHeader title="Campus Chat" description="Chat with everyone from your college" />

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-2 rounded-xl border bg-card p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
            <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
            No messages yet — say hi to your campus!
          </p>
        ) : (
          messages.map((m) => {
            const isMe = m.user.id.toString() === myId

            if (m.isDeleted) {
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted/50 italic text-xs text-muted-foreground">
                    Message deleted
                  </div>
                </div>
              )
            }

            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"} relative`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-1.5 select-none ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}
                  onPointerDown={() => startPress(m)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                  onTouchStart={(e) => handleTouchStart(e, m)}
                  onTouchEnd={(e) => handleTouchEnd(e, m)}
                >
                  {!isMe && (
                    <p className="text-[11px] font-semibold mb-0.5" style={{ color: "oklch(0.55 0.15 278)" }}>
                      {m.user.name}
                    </p>
                  )}

                  {m.replyTo && (
                    <div className={`mb-1 rounded px-2 py-1 border-l-2 text-[11px] ${isMe ? "border-white/40 bg-white/10" : "border-primary/40 bg-background/50"}`}>
                      <p className="font-semibold">{m.replyTo.user.name}</p>
                      <p className="truncate opacity-80">{m.replyTo.content}</p>
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {m.isEdited && <span className={`text-[9px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>edited</span>}
                    <span className={`text-[9px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                </div>

                {activeMenuId === m.id && (
                  <div className={`absolute -top-9 ${isMe ? "right-0" : "left-0"} flex gap-1 rounded-lg border bg-card shadow-lg p-1 z-10`}>
                    <button onClick={() => { setReplyingTo(m); setActiveMenuId(null) }} className="p-1.5 hover:bg-muted rounded">
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                    {isMe ? (
                      <>
                        <button onClick={() => startEdit(m)} className="p-1.5 hover:bg-muted rounded">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteMessage(m.id)} className="p-1.5 hover:bg-muted rounded text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => blockUser(m.user.id)} className="px-2 py-1.5 text-xs hover:bg-muted rounded text-red-500">
                        Block
                      </button>
                    )}
                    <button onClick={() => setActiveMenuId(null)} className="p-1.5 hover:bg-muted rounded">
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
        <div className="flex items-center justify-between text-xs bg-muted/50 px-3 py-1.5 rounded-t-lg mt-3">
          <span>{editingId ? "Editing message" : `Replying to ${replyingTo?.user.name}`}</span>
          <button onClick={() => { setEditingId(null); setReplyingTo(null); setInput("") }}><X className="h-3 w-3" /></button>
        </div>
      )}

      <form onSubmit={handleSend} className={`flex gap-2 ${editingId || replyingTo ? "" : "mt-3"}`}>
        <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} className="h-10" />
        <Button type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}