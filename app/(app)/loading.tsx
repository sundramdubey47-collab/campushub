import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}