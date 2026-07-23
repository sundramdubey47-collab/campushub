import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-48" />
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  )
}