// Natural-language date parsing for the chat box. Handles the common shapes:
//   "one week in October", "2 weeks in August", "10 nights in July"
//   "August 1-15", "1 - 15 August", "Oct 5 for a week"
//   "next week", "this weekend"
// Returns an ISO check-in / check-out pair, or null when no dates are present.

const MONTHS: Record<string, number> = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3, may: 4,
  june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8, sept: 8,
  october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}
function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
function clampNights(n: number): number {
  return Math.min(Math.max(n, 1), 60)
}

// First future occurrence of (month, day).
function upcoming(monthIdx: number, day: number, today: Date): Date {
  let y = today.getFullYear()
  const clamp = (yy: number) => Math.min(Math.max(day, 1), daysInMonth(yy, monthIdx))
  let d = new Date(y, monthIdx, clamp(y))
  if (d < today) {
    y++
    d = new Date(y, monthIdx, clamp(y))
  }
  return d
}

function parseDuration(lower: string): number | null {
  let m
  if ((m = lower.match(/(\d+)\s*nights?\b/))) return clampNights(+m[1])
  if ((m = lower.match(/(\d+)\s*weeks?\b/))) return clampNights(+m[1] * 7)
  if (/\b(?:a|one)\s+week\b/.test(lower)) return 7
  if (/\btwo\s+weeks\b/.test(lower)) return 14
  if ((m = lower.match(/(\d+)\s*days?\b/))) return clampNights(+m[1])
  if (/\bweekend\b/.test(lower)) return 2
  return null
}

function findDay(lower: string, name: string): number | null {
  let m
  if ((m = lower.match(new RegExp(`\\b${name}\\s+(\\d{1,2})\\b`)))) return +m[1]
  if ((m = lower.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?${name}\\b`)))) return +m[1]
  return null
}

export function parseDates(text: string): { checkin: string; checkout: string } | null {
  const lower = text.toLowerCase()
  const today = startOfToday()
  const dur = parseDuration(lower)
  const range = lower.match(/\b(\d{1,2})\s*(?:-|–|—|to|until|till)\s*(\d{1,2})\b/)

  // Qualified month — guards against "may" the modal verb: a month only counts
  // when prefixed by in/for/this/next/etc, sits next to a day number, or the
  // text carries a duration/range.
  let monthIdx: number | null = null
  let monthName = ''
  let monthPos = Infinity
  for (const [name, idx] of Object.entries(MONTHS)) {
    const m = new RegExp(`\\b${name}\\b`).exec(lower)
    if (!m) continue
    const before = lower.slice(Math.max(0, m.index - 8), m.index)
    const around = lower.slice(Math.max(0, m.index - 4), m.index + name.length + 4)
    const qualified =
      /\b(in|for|during|this|next|early|late|mid|by|the)\s+$/.test(before) ||
      /\d/.test(around) ||
      dur != null ||
      range != null
    if (qualified && m.index < monthPos) {
      monthIdx = idx
      monthName = name
      monthPos = m.index
    }
  }

  // Relative phrases (only when no month/range anchor is given).
  if (monthIdx == null && !range) {
    if (/\bnext week\b/.test(lower)) {
      const ci = addDays(today, 7)
      return { checkin: iso(ci), checkout: iso(addDays(ci, dur ?? 7)) }
    }
    if (/\b(this|next)\s+weekend\b/.test(lower) || /\bweekend\b/.test(lower)) {
      // upcoming Saturday (getDay 6)
      let ci = addDays(today, (6 - today.getDay() + 7) % 7 || 7)
      return { checkin: iso(ci), checkout: iso(addDays(ci, 2)) }
    }
  }

  if (monthIdx != null) {
    const d1 = range ? +range[1] : null
    const checkin = upcoming(monthIdx, d1 ?? findDay(lower, monthName) ?? 1, today)
    let checkout: Date
    if (range) {
      const d2 = +range[2]
      checkout =
        d2 > (d1 as number)
          ? new Date(checkin.getFullYear(), monthIdx, Math.min(d2, daysInMonth(checkin.getFullYear(), monthIdx)))
          : addDays(checkin, dur ?? 7)
    } else {
      checkout = addDays(checkin, dur ?? 7)
    }
    return { checkin: iso(checkin), checkout: iso(checkout) }
  }

  // Numeric range without a month — anchor to the next month whose d1 is future.
  if (range) {
    const d1 = +range[1]
    const d2 = +range[2]
    let y = today.getFullYear()
    let mo = today.getMonth()
    let checkin = new Date(y, mo, Math.min(d1, daysInMonth(y, mo)))
    if (checkin < today) {
      mo++
      if (mo > 11) {
        mo = 0
        y++
      }
      checkin = new Date(y, mo, Math.min(d1, daysInMonth(y, mo)))
    }
    const checkout =
      d2 > d1
        ? new Date(checkin.getFullYear(), checkin.getMonth(), Math.min(d2, daysInMonth(checkin.getFullYear(), checkin.getMonth())))
        : addDays(checkin, dur ?? 7)
    return { checkin: iso(checkin), checkout: iso(checkout) }
  }

  return null
}
