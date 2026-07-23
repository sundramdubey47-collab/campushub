export function normalizeHHMM(value: string): string {
  return value.trim().slice(0, 5)
}

export function getISTParts(): { hhmm: string; dayOfWeek: number } {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  })
  const parts = formatter.formatToParts(now)
  let hour = parts.find((p) => p.type === "hour")?.value ?? "00"
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00"
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun"

  // hour12:false kabhi kabhi "24" deta hai midnight ke liye, use "00" karna zaroori hai
  if (hour === "24") hour = "00"

  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

  return {
    hhmm: `${hour}:${minute}`,
    dayOfWeek: dayMap[weekday] ?? 0,
  }
}

export function getISTDateString(): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" })
  return formatter.format(now)
}

export function getISTMidnightUTC(): Date {
  return new Date(`${getISTDateString()}T00:00:00.000Z`)
}

export function minutesBetween(hhmmA: string, hhmmB: string): number {
  const [ha, ma] = normalizeHHMM(hhmmA).split(":").map(Number)
  const [hb, mb] = normalizeHHMM(hhmmB).split(":").map(Number)
  return (hb * 60 + mb) - (ha * 60 + ma)
}