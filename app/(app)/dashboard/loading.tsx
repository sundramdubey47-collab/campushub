import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}