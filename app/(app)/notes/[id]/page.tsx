"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Bookmark, BookmarkCheck } from "lucide-react"
import { WhatsAppShare } from "@/components/whatsapp-share"

type Note = {
  id: number
  title: string
  description: string | null
  fileUrl: string
  isPremium: boolean
  createdAt: string
  category: string
  unit: string | null
  views: number
  downloads: number
  uploadedBy: { name: string; college: { name: string } | null }
  university: { name: string }
  course: { name: string }
  semester: { number: number }
  subject: { name: string } | null
}

type Comment = {
  id: number
  content: string
  createdAt: string
  user: { name: string }
}

export default function NoteDetailPage() {
  const params = useParams()
  const noteId = params.id

  const [note, setNote] = useState<Note | null>(null)
  const [rating, setRating] = useState({ average: 0, count: 0 })
  const [myRating, setMyRating] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    fetch(`/api/notes/${noteId}`).then((r) => r.json()).then(setNote)
    fetch(`/api/notes/${noteId}/rating`).then((r) => r.json()).then(setRating)
    fetch(`/api/notes/${noteId}/bookmark`).then((r) => r.json()).then((d) => setBookmarked(d.bookmarked))
    fetch(`/api/notes/${noteId}/comments`).then((r) => r.json()).then(setComments)
  }, [noteId])

  async function handleRate(value: number) {
    setMyRating(value)
    const res = await fetch(`/api/notes/${noteId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    })
    const data = await res.json()
    setRating(data)
  }

  async function handleBookmarkToggle() {
    const res = await fetch(`/api/notes/${noteId}/bookmark`, { method: "POST" })
    const data = await res.json()
    setBookmarked(data.bookmarked)
  }

  async function handleDownload() {
    const res = await fetch(`/api/notes/${noteId}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "download" }),
    })

    if (res.status === 403) {
      const data = await res.json()
      alert(data.message)
      return false
    }

    return true
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    const res = await fetch(`/api/notes/${noteId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    })
    const comment = await res.json()
    setComments([comment, ...comments])
    setNewComment("")
  }

  if (!note) return <p className="text-muted-foreground">Load ho raha hai...</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <Button variant="outline" size="icon" onClick={handleBookmarkToggle}>
            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
        </div>

        {note.description && <p className="text-muted-foreground">{note.description}</p>}

        <div className="flex flex-wrap gap-1">
          <span className="text-xs bg-muted px-2 py-1 rounded">{note.category}</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">{note.course.name}</span>
          <span className="text-xs bg-muted px-2 py-1 rounded">Sem {note.semester.number}</span>
          {note.subject && <span className="text-xs bg-muted px-2 py-1 rounded">{note.subject.name}</span>}
        </div>

        <div className="text-sm text-muted-foreground space-y-0.5">
          <p>By {note.uploadedBy.name} — {note.uploadedBy.college?.name ?? "N/A"}</p>
          <p>{note.university.name}</p>
          <p>{new Date(note.createdAt).toLocaleDateString()}</p>
          <p>{note.views} views • {note.downloads} downloads</p>
        </div>

        <Button
          onClick={async () => {
            const allowed = await handleDownload()
            if (allowed) {
              window.open(note.fileUrl, "_blank")
            }
          }}
        >
          Preview / Download
        </Button>
      </div>
<WhatsAppShare
  text={`Check out "${note.title}" on CampusHub`}
  url={typeof window !== "undefined" ? window.location.href : ""}
/>
      <div className="space-y-2">
        <h2 className="font-semibold">Rating</h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => handleRate(star)}>
              <Star
                className={`h-6 w-6 ${star <= myRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
              />
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {rating.average ? rating.average.toFixed(1) : "0"} ({rating.count} ratings)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Comments</h2>

        <form onSubmit={handleCommentSubmit} className="space-y-2">
          <Textarea
            placeholder="Comment likho..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="submit" size="sm">Post</Button>
        </form>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments available yet,check after some time</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border rounded-lg p-3">
                <p className="text-sm font-medium">{c.user.name}</p>
                <p className="text-sm text-muted-foreground">{c.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}