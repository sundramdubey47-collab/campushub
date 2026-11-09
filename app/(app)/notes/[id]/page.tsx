
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { triggerDownload } from "@/lib/download"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { WhatsAppShare } from "@/components/whatsapp-share"

import {
  Star,
  Bookmark,
  BookmarkCheck,
  Download,
  Eye,
  CalendarDays,
  User,
  GraduationCap,
  Building2,
  MessageCircle,
  Crown,
} from "lucide-react"

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

  uploadedBy: {
    name: string
    college: {
      name: string
    } | null
  }

  university: {
    name: string
  }

  course: {
    name: string
  }

  semester: {
    number: number
  }

  subject: {
    name: string
  } | null
}

type Comment = {
  id: number
  content: string
  createdAt: string
  user: {
    name: string
  }
}

export default function NoteDetailPage() {
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const [rating, setRating] = useState({
    average: 0,
    count: 0,
  })

  const [myRating, setMyRating] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    if (!noteId) return

    let cancelled = false

    async function loadData() {
      setPageLoading(true)
      setPageError(false)

      try {
        const [noteRes, ratingRes, bookmarkRes, commentsRes] =
          await Promise.all([
            fetch(`/api/notes/${noteId}`),
            fetch(`/api/notes/${noteId}/rating`),
            fetch(`/api/notes/${noteId}/bookmark`),
            fetch(`/api/notes/${noteId}/comments`),
          ])

        if (!noteRes.ok) {
          throw new Error("Failed to load note")
        }

        const noteData = await noteRes.json()
        const ratingData = ratingRes.ok
          ? await ratingRes.json()
          : { average: 0, count: 0 }

        const bookmarkData = bookmarkRes.ok
          ? await bookmarkRes.json()
          : { bookmarked: false }

        const commentsData = commentsRes.ok
          ? await commentsRes.json()
          : []

        if (cancelled) return

        setNote(noteData)
        setRating(ratingData)
        setBookmarked(bookmarkData.bookmarked ?? false)
        setComments(Array.isArray(commentsData) ? commentsData : [])
      } catch (error) {
        console.error("Note loading error:", error)

        if (!cancelled) {
          setPageError(true)
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [noteId])

  async function handleRate(value: number) {
    setMyRating(value)

    try {
      const res = await fetch(`/api/notes/${noteId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      })

      if (!res.ok) {
        alert("Unable to submit rating")
        return
      }

      const data = await res.json()
      setRating(data)
    } catch (error) {
      console.error("Rating error:", error)
      alert("Something went wrong")
    }
  }

  async function handleBookmarkToggle() {
    try {
      const res = await fetch(`/api/notes/${noteId}/bookmark`, {
        method: "POST",
      })

      if (!res.ok) {
        alert("Unable to update bookmark")
        return
      }

      const data = await res.json()
      setBookmarked(data.bookmarked)
    } catch (error) {
      console.error("Bookmark error:", error)
      alert("Something went wrong")
    }
  }

  async function handleDownload() {
    if (!note || downloadLoading) return

    setDownloadLoading(true)

    try {
      // Premium access validation + download tracking
      const res = await fetch(`/api/notes/${noteId}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "download",
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))

        if (res.status === 403) {
          alert(data.message || "Premium access required")
        } else {
          alert(data.message || "Download failed")
        }

        return
      }

      // Actual file download
      triggerDownload(note.fileUrl, note.title)
    } catch (error) {
      console.error("Download error:", error)
      alert("Something went wrong while downloading")
    } finally {
      setDownloadLoading(false)
    }
  }

  async function handleCommentSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (!newComment.trim()) return

    try {
      const res = await fetch(`/api/notes/${noteId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.message || "Unable to post comment")
        return
      }

      const comment = await res.json()

      setComments((prev) => [comment, ...prev])
      setNewComment("")
    } catch (error) {
      console.error("Comment error:", error)
      alert("Something went wrong")
    }
  }

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="rounded-3xl border bg-background shadow-xl px-8 py-10 text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />

          <p className="text-muted-foreground">
            Loading note...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (pageError || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <div className="rounded-3xl border bg-background shadow-xl px-8 py-10 text-center space-y-4">
          <FileTextIcon />

          <h2 className="text-xl font-bold">
            Resource Not Found
          </h2>

          <p className="text-sm text-muted-foreground">
            This resource could not be loaded.
          </p>

          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background py-5 sm:py-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 space-y-6">

        {/* HERO CARD */}
        <div className="rounded-3xl border bg-background/80 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="p-5 sm:p-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-5">
              <div className="space-y-4">

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {note.category.replace(/_/g, " ")}
                  </span>

                  {note.isPremium && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-semibold flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
                  {note.title}
                </h1>

                {note.description && (
                  <p className="text-muted-foreground text-sm sm:text-base max-w-3xl">
                    {note.description}
                  </p>
                )}
              </div>

              {/* BOOKMARK */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 shrink-0 shadow-md"
                onClick={handleBookmarkToggle}
              >
                {bookmarked ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-xs">Course</span>
                </div>

                <p className="font-semibold mt-2">
                  {note.course.name}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">University</span>
                </div>

                <p className="font-semibold mt-2">
                  {note.university.name}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs">Semester</span>
                </div>

                <p className="font-semibold mt-2">
                  Semester {note.semester.number}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-xs">Uploaded By</span>
                </div>

                <p className="font-semibold mt-2">
                  {note.uploadedBy.name}
                </p>
              </div>
            </div>

            {/* STATS + PREVIEW / DOWNLOAD */}
            <div className="mt-5 rounded-2xl border bg-muted/20 p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">

              {/* STATS */}
              <div className="flex gap-6">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Eye className="h-4 w-4" />
                    Views
                  </div>

                  <p className="font-bold text-lg">
                    {note.views}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Download className="h-4 w-4" />
                    Downloads
                  </div>

                  <p className="font-bold text-lg">
                    {note.downloads}
                  </p>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                {/* PREVIEW */}
                <Button
                  variant="outline"
                  className="rounded-xl h-12 px-6 w-full sm:w-auto"
                  onClick={() => {
                    window.open(
                      note.fileUrl,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }}
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Preview
                </Button>

                {/* DOWNLOAD */}
                <Button
                  className="rounded-xl h-12 px-6 w-full sm:w-auto shadow-lg"
                  onClick={handleDownload}
                  disabled={downloadLoading}
                >
                  <Download className="h-5 w-5 mr-2" />

                  {downloadLoading
                    ? "Downloading..."
                    : "Download"}
                </Button>
              </div>
            </div>

            {/* SHARE */}
            <div className="mt-5 rounded-2xl border p-4 bg-background">
              <WhatsAppShare
                text={`Check out "${note.title}" on CampusHub`}
                url={
                  typeof window !== "undefined"
                    ? window.location.href
                    : ""
                }
              />
            </div>

            {/* RATING */}
            <div className="mt-6 rounded-3xl border bg-background p-5 sm:p-6">
              <h2 className="font-bold text-lg mb-4">
                Rate this Note
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className="transition hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= myRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <span className="text-sm text-muted-foreground">
                  {rating.average
                    ? rating.average.toFixed(1)
                    : "0"}{" "}
                  ({rating.count} ratings)
                </span>
              </div>
            </div>

            {/* COMMENTS */}
            <div className="rounded-3xl border bg-background p-5 sm:p-6 space-y-5">

              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />

                <h2 className="text-lg font-bold">
                  Comments
                </h2>
              </div>

              {/* COMMENT FORM */}
              <form
                onSubmit={handleCommentSubmit}
                className="space-y-3"
              >
                <Textarea
                  placeholder="Write down your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[110px] rounded-2xl resize-none"
                />

                <Button
                  type="submit"
                  className="rounded-xl px-6"
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </form>

              {/* COMMENT LIST */}
              <div className="space-y-4 pt-3">
                {comments.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-muted/30">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      No comments available yet
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      Be the first one to comment
                    </p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border bg-muted/20 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-sm">
                          {c.user.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// Small icon for error state
function FileTextIcon() {
  return (
    <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center">
      <Download className="h-8 w-8 text-primary" />
    </div>
  )
}
