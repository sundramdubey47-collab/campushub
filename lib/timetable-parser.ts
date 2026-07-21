import * as XLSX from "xlsx"

export type ParsedRow = {
  rowIndex: number
  dayOfWeek: number | null
  startTime: string
  endTime: string
  subjectName: string
  room: string
  facultyName: string
  section: string
  errors: string[]
}

const DAY_MAP: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
}

function normalizeTime(value: any): string {
  if (typeof value === "number") {
    // Excel time serial (fraction of a day)
    const totalMinutes = Math.round(value * 24 * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }
  const str = String(value).trim()
  const match = str.match(/^(\d{1,2}):(\d{2})/)
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`
  }
  return str
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseTimetableFile(buffer: Buffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })

  const parsed: ParsedRow[] = []

  rawRows.forEach((row, index) => {
    const errors: string[] = []

    // Column names case-insensitive: Day, StartTime, EndTime, Subject, Room, Faculty, Section
    const getVal = (keys: string[]) => {
      for (const key of Object.keys(row)) {
        if (keys.includes(key.trim().toLowerCase())) return row[key]
      }
      return ""
    }

    const dayRaw = String(getVal(["day", "dayofweek"])).trim().toLowerCase()
    const dayOfWeek = DAY_MAP[dayRaw] ?? null
    if (dayOfWeek === null) errors.push(`Invalid or missing day: "${dayRaw}"`)

    const startTime = normalizeTime(getVal(["starttime", "start time", "start"]))
    if (!TIME_REGEX.test(startTime)) errors.push(`Invalid start time: "${startTime}"`)

    const endTime = normalizeTime(getVal(["endtime", "end time", "end"]))
    if (!TIME_REGEX.test(endTime)) errors.push(`Invalid end time: "${endTime}"`)

    if (TIME_REGEX.test(startTime) && TIME_REGEX.test(endTime) && startTime >= endTime) {
      errors.push("Start time must be before end time")
    }

    const subjectName = String(getVal(["subject", "subjectname"])).trim()
    if (!subjectName) errors.push("Subject is required")

    const room = String(getVal(["room", "venue"])).trim()
    const facultyName = String(getVal(["faculty", "facultyname", "teacher"])).trim()
    const section = String(getVal(["section"])).trim().toUpperCase() || "A"

    parsed.push({
      rowIndex: index + 2, // +2 because row 1 is header, arrays are 0-indexed
      dayOfWeek,
      startTime,
      endTime,
      subjectName,
      room,
      facultyName,
      section,
      errors,
    })
  })

  // Duplicate + conflict check (same section, same day, overlapping time)
  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const a = parsed[i]
      const b = parsed[j]
      if (a.dayOfWeek === null || b.dayOfWeek === null) continue
      if (a.dayOfWeek !== b.dayOfWeek || a.section !== b.section) continue

      const overlap = a.startTime < b.endTime && b.startTime < a.endTime
      if (overlap) {
        if (!a.errors.some((e) => e.includes("conflicts with row"))) {
          a.errors.push(`Time conflicts with row ${b.rowIndex} (same section, same day)`)
        }
        if (!b.errors.some((e) => e.includes("conflicts with row"))) {
          b.errors.push(`Time conflicts with row ${a.rowIndex} (same section, same day)`)
        }
      }
    }
  }

  return parsed
}