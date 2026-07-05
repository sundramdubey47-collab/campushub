"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Plus } from "lucide-react"

type Message = {
  id: number
  role: "USER" | "ASSISTANT"
  content: string
}

type SessionSummary = {
  id: number
  title: string
  updatedAt: string
}

export default function AIAssistantPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  async function loadSessions() {
    const res = await fetch("/api/ai-chat/sessions")
    const data = await res.json()
    setSessions(data)
  }

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function openSession(id: number) {
    const res = await fetch(`/api/ai-chat/sessions/${id}`)
    const data = await res.json()
    setCurrentSessionId(id)
    setMessages(data.messages)
  }

  function startNewChat() {
    setCurrentSessionId(null)
    setMessages([])
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    setError("")
    const userMessage = input
    setInput("")

    setMessages((prev) => [...prev, { id: Date.now(), role: "USER", content: userMessage }])
    setLoading(true)

    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: currentSessionId, message: userMessage }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setCurrentSessionId(data.sessionId)
    setMessages((prev) => [...prev, { id: Date.now() + 1, role: "ASSISTANT", content: data.reply }])
    loadSessions()
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat History Sidebar */}
      <div className="hidden md:flex w-56 flex-col border rounded-lg p-3 gap-2 overflow-y-auto">
        <Button size="sm" onClick={startNewChat}>
          <Plus className="h-4 w-4 mr-1" /> Naya Chat
        </Button>
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => openSession(s.id)}
            className={`text-left text-sm p-2 rounded-lg hover:bg-muted truncate ${
              currentSessionId === s.id ? "bg-muted" : ""
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col border rounded-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center mt-10">
              👋 Namaste! Main CampusHub AI Assistant hoon. Kuch bhi pucho — padhai, coding, career, ya CampusHub ke features ke baare me.
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap ${
                    m.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading && <p className="text-sm text-muted-foreground">AI soch raha hai...</p>}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="text-sm text-red-500 px-4">{error}</p>}

        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t">
          <Textarea
            placeholder="Kuch bhi pucho..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            rows={1}
            className="resize-none"
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}