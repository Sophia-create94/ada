// Date helpers shared by the calendar popover, the filter-cell displays,
// and the param collector — ported from ada-landing.html.

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fmtShort(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

/**
 * Smart date-range formatter:
 *   - same month  → "15 - 21 Jun"
 *   - same year, different months → "1 Jun - 18 Aug"
 */
export function formatDateRange(start: Date, end: Date): string {
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = start.toLocaleDateString('en-GB', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-GB', { month: 'short' })
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
  if (sameMonth) return `${startDay} - ${endDay} ${endMonth}`
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
}
