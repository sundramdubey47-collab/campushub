import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/empty-state"
import { FileUp } from "lucide-react"

export default async function MyUploadsPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: {
      uploadedNotes: {
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, views: true, downloads: true, createdAt: true, isPremium: true },
      },
    },
  })

  const notes = dbUser?.uploadedNotes ?? []

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <h1 className="text-2xl font-bold">My Uploads</h1>

      {notes.length === 0 ? (
        <EmptyState icon={FileUp} title="No uploads yet" description="Share your notes and help fellow students" />
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="rounded-xl border bg-card p-4 hover:border-primary transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(note.createdAt).toLocaleDateString()}
                    {note.isPremium && " • Premium"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 ml-2">{note.views} views • {note.downloads} downloads</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}