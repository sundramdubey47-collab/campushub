"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/page-header"
import { MessageCircle, Send } from "lucide-react"
import { BlockUserButton } from "@/components/block-user-button"

type Message = {
  id: number
  content: string
  createdAt: string
  userId: number
  user: { name: string }
}

export default function CampusChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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

  const myName = session?.user?.name

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
            const isMe = m.user.name === myName
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.user.name}</p>
                  {!isMe && (
  <BlockUserButton targetUserId={m.userId} />
)}
                  <p className="text-sm">{m.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-3">
        <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} className="h-10" />
        <Button type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}