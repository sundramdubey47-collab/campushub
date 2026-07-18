import Link from "next/link"
import { ArrowLeft, Bookmark } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/empty-state"

export default async function MyBookmarksPage() {
  const session = await auth()
  const dbUser = await prisma.user.findUnique({
    where: { email: session?.user?.email ?? "" },
    select: {
      bookmarks: {
        orderBy: { createdAt: "desc" },
        include: { note: { select: { id: true, title: true } } },
      },
    },
  })

  const bookmarks = dbUser?.bookmarks ?? []

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <h1 className="text-2xl font-bold">Bookmarked Resources</h1>

      {bookmarks.length === 0 ? (
        <EmptyState icon={Bookmark} title="No bookmarks yet" description="Save resources to find them quickly later" />
      ) : (
        <div className="space-y-2">
          {bookmarks.map((b) => (
            <Link key={b.id} href={`/notes/${b.note.id}`}>
              <div className="rounded-xl border bg-card p-4 hover:border-primary transition-colors text-sm">
                {b.note.title}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}