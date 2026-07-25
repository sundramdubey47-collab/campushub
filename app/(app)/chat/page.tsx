"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { BlockUserButton } from "@/components/block-user-button"
import { MessageCircle, Send, Pencil, Trash2, X } from "lucide-react"

type Message = {
  id: number
  content: string
  createdAt: string
  isEdited?: boolean
  isDeleted?: boolean
  user: { id: number; name: string }
}

export default function CampusChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)

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
      body: JSON.stringify({ content: input }),
    })

    const data = await res.json()
    setSending(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setInput("")
    setMessages((prev) => [...prev, data])
  }

  function startPress(msg: Message) {
    if (msg.user.id.toString() !== (session?.user as any)?.id) return
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
                  className={`max-w-[80%] rounded-lg px-3 py-2 select-none ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  onPointerDown={() => startPress(m)}
                  onPointerUp={cancelPress}
                  onPointerLeave={cancelPress}
                >
                  {!isMe && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.user.name}</p>}
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  {m.isEdited && <p className="text-[9px] opacity-60 mt-0.5">edited</p>}
                  {!isMe && <div className="mt-1"><BlockUserButton targetUserId={m.user.id} /></div>}
                </div>

                {activeMenuId === m.id && isMe && (
                  <div className="absolute -top-9 right-0 flex gap-1 rounded-lg border bg-card shadow-lg p-1 z-10">
                    <button onClick={() => startEdit(m)} className="p-1.5 hover:bg-muted rounded">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteMessage(m.id)} className="p-1.5 hover:bg-muted rounded text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

      {editingId && (
        <div className="flex items-center justify-between text-xs bg-muted/50 px-3 py-1.5 rounded-t-lg mt-3">
          <span>Editing message</span>
          <button onClick={() => { setEditingId(null); setInput("") }}><X className="h-3 w-3" /></button>
        </div>
      )}

      <form onSubmit={handleSend} className={`flex gap-2 ${editingId ? "" : "mt-3"}`}>
        <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} className="h-10" />
        <Button type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}