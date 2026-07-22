export function nowHHMM(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
}

export function subtractMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number)
  const total = h * 60 + m - minutes
  const adjusted = ((total % 1440) + 1440) % 1440
  const hh = Math.floor(adjusted / 60)
  const mm = adjusted % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

export function todayMidnight(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}