export function AttendanceRing({ percent }: { percent: number }) {
  const color = percent >= 75 ? "oklch(var(--success))" : percent >= 50 ? "oklch(0.72 0.15 60)" : "oklch(0.6 0.18 25)"
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
        <circle
          cx="22" cy="22" r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-bold" style={{ color }}>{percent}%</span>
      </div>
    </div>
  )
}