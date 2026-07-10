import { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <div className="relative rounded-full bg-gradient-to-br from-primary/15 to-primary/5 p-5 border border-primary/10">
          <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="font-semibold text-base">{title}</p>
        {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      {action}
    </div>
  )
}