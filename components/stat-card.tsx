import { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon?: LucideIcon
}) {
  return (
    <div className="ch-notebook-line rounded-xl border bg-card p-5 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  )
}