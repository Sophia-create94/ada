import type { Stay, ResultsParams, StyleId, AmenityId, BookingTag } from './types'
import { STAYS } from './stays.data'
import { STYLE_LABELS } from './styles'

export { STAYS }
export type { Stay }

/* ------- helpers ------- */

function shuffle<T>(arr: T[]): T[] {
  // Fisher–Yates, seeded by the runtime RNG so "I'm flexible" produces a
  // different set on every page load.
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ------- params parsing ------- */

export function parseResultsParams(sp: URLSearchParams): ResultsParams {
  const via = (sp.get('via') as ResultsParams['via']) || 'filters'
  const list = (key: string) => {
    const raw = sp.get(key)
    return raw ? raw.split(',').filter(Boolean) : undefined
  }
  const num = (key: string) => {
    const raw = sp.get(key)
    if (raw == null) return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  return {
    via: via === 'chat' || via === 'mood' ? via : 'filters',
    where: sp.get('where') ?? undefined,
    area: sp.get('area') ?? undefined,
    notCovered: sp.get('unknown') ?? undefined,
    suggest: sp.get('suggest') ?? undefined,
    suggestCovered: sp.get('suggestCovered') === '1',
    checkin: sp.get('checkin') ?? undefined,
    checkout: sp.get('checkout') ?? undefined,
    guests: num('guests'),
    infants: num('infants'),
    pets: num('pets'),
    maxPrice: num('price'),
    style: (sp.get('style') as StyleId) ?? undefined,
    wifi: sp.get('wifi') ?? undefined,
    reviews: sp.get('reviews') ?? undefined,
    rating: sp.get('rating') ?? undefined,
    amenities: list('amenities') as AmenityId[] | undefined,
    booking: list('booking') as BookingTag[] | undefined,
    q: sp.get('q') ?? undefined,
    mood: sp.get('mood') ?? undefined,
  }
}

/* ============================================================
 * PICKER — turns a ResultsParams into exactly five stays.
 * ========================================================== */
export function pickStays(params: ResultsParams): Stay[] {
  // Named a real city Ada doesn't serve yet, or a likely typo → return nothing
  // rather than substituting other destinations.
  if (params.notCovered || params.suggest) return []

  let pool: Stay[] = [...STAYS]

  // 1. City — filter, or shuffle the whole pool for "I'm flexible".
  if (params.where === 'flexible') {
    pool = shuffle(pool)
  } else if (params.where) {
    pool = pool.filter((s) => s.city === params.where)
  }

  // 2. Hard filters — a stay that fails any of these must never be shown,
  //    even if it means returning fewer than five.
  pool = pool.filter((s) => satisfiesHard(s, params))

  // 3. Ranking. Style match floats up; then, when the user gave a budget or a
  //    party size, the cheapest and tightest-fitting stays lead; then rating.
  pool.sort((a, b) => {
    if (params.style) {
      const d = (b.style === params.style ? 1 : 0) - (a.style === params.style ? 1 : 0)
      if (d) return d
    }
    if (params.maxPrice && a.priceValue !== b.priceValue) return a.priceValue - b.priceValue
    if (params.guests && a.maxGuests !== b.maxGuests) return a.maxGuests - b.maxGuests
    return b.rating - a.rating
  })

  // 4. Backfill toward five — but ONLY with stays that also satisfy every hard
  //    constraint, so a budget/guest cap is never violated to hit the count.
  if (pool.length < 5) {
    const base = STAYS.filter(
      (s) =>
        (!params.where || params.where === 'flexible' || s.city === params.where) &&
        satisfiesHard(s, params),
    ).sort((a, b) => b.rating - a.rating)
    pool = [...pool, ...base.filter((s) => !pool.includes(s))]
  }

  return pool.slice(0, 5)
}

// Cheapest stay Ada tracks in a given city — used to explain an empty result
// set (e.g. "the lowest New York stay is $295/night").
export function cheapestInCity(city: string): Stay | undefined {
  return cheapestInScope(city)
}

// Cheapest stay in a city, optionally narrowed to a neighbourhood/borough —
// used to explain an empty result set ("the lowest Brooklyn stay is $410").
export function cheapestInScope(city: string, area?: string): Stay | undefined {
  let scope = STAYS.filter((s) => s.city === city)
  if (area) scope = scope.filter((s) => s.loc.toLowerCase().includes(area.toLowerCase()))
  if (!scope.length) return undefined
  return scope.reduce((a, b) => (b.priceValue < a.priceValue ? b : a))
}

/* ============================================================
 * AVAILABILITY — each stay carries a deterministic set of "booked"
 * date ranges (derived from its id) over the coming year, so picking
 * dates — from the calendar OR the chat — genuinely excludes stays
 * that aren't free, and the same stay always books the same way.
 * ========================================================== */
function seedFromId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TODAY = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})()
const DAY_MS = 86400000
const blockCache = new Map<string, Array<[number, number]>>()

// Booked ranges as [startOffset, endOffset] day-counts from today.
function blockedRanges(id: string): Array<[number, number]> {
  const cached = blockCache.get(id)
  if (cached) return cached
  const rnd = mulberry32(seedFromId(id))
  const ranges: Array<[number, number]> = []
  let cursor = 7 + Math.floor(rnd() * 21) // first booking 7–28 days out
  for (let i = 0; i < 4; i++) {
    const len = 4 + Math.floor(rnd() * 11) // 4–14 night stays
    ranges.push([cursor, cursor + len])
    cursor += len + 16 + Math.floor(rnd() * 55) // gap before the next booking
  }
  blockCache.set(id, ranges)
  return ranges
}

export function isAvailable(stay: Stay, checkin?: string, checkout?: string): boolean {
  if (!checkin || !checkout) return true
  const ci = parseISO(checkin)
  const co = parseISO(checkout)
  if (!ci || !co) return true
  const start = Math.round((ci.getTime() - TODAY.getTime()) / DAY_MS)
  const end = Math.round((co.getTime() - TODAY.getTime()) / DAY_MS)
  // Overlap if requested [start, end) intersects any booked [bs, be).
  return !blockedRanges(stay.id).some(([bs, be]) => start < be && bs < end)
}

// Hard constraints — dates, location, guests, budget, and the advanced filters.
// A stay that fails any of these is excluded outright.
function satisfiesHard(s: Stay, p: ResultsParams): boolean {
  if (!isAvailable(s, p.checkin, p.checkout)) return false
  if (p.area && !s.loc.toLowerCase().includes(p.area.toLowerCase())) return false
  if (p.guests && s.maxGuests < p.guests) return false
  if (p.maxPrice && s.priceValue > p.maxPrice) return false
  if (p.wifi && p.wifi !== 'any' && s.wifiSpeed < Number(p.wifi)) return false
  if (p.reviews && p.reviews !== 'any' && s.reviews < Number(p.reviews)) return false
  if (p.rating && p.rating !== 'any' && s.rating < Number(p.rating)) return false
  if (p.amenities?.length && !p.amenities.every((a) => s.amenities.includes(a))) return false
  if (p.booking?.length && !p.booking.every((b) => s.booking.includes(b))) return false
  return true
}

/* ============================================================
 * CONTEXT LINE — recaps the search beneath the results title.
 * ========================================================== */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseISO(iso: string): Date | null {
  const d = new Date(iso + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateRange(checkin: string, checkout: string): string {
  const start = parseISO(checkin)
  const end = parseISO(checkout)
  if (!start || !end) return ''
  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = MONTHS[start.getMonth()]
  const endMonth = MONTHS[end.getMonth()]
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
  if (sameMonth) return `${startDay} - ${endDay} ${endMonth}`
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`
}

export function buildContextLine(params: ResultsParams): string {
  if (params.via === 'chat' || params.via === 'mood') {
    return params.q ?? ''
  }

  // Order mirrors the filter row: WHERE · WHEN · WHO · STYLE · advanced.
  const parts: string[] = []

  if (params.where === 'flexible') parts.push("Ada's flexible picks")
  else if (params.where) parts.push('In ' + params.where)

  if (params.area) parts.push(params.area)

  if (params.checkin && params.checkout)
    parts.push(formatDateRange(params.checkin, params.checkout))

  const guests = params.guests ?? 0
  if (guests > 0) parts.push(guests + (guests === 1 ? ' guest' : ' guests'))

  if (params.style) parts.push(STYLE_LABELS[params.style] + ' stays')

  const adv: string[] = []
  if (params.maxPrice) {
    const sym =
      params.where && params.where !== 'flexible'
        ? cheapestInCity(params.where)?.priceDisplay.match(/^[^\d]+/)?.[0] ?? '$'
        : '$'
    adv.push(`under ${sym}${params.maxPrice}/night`)
  }
  if (params.wifi && params.wifi !== 'any') adv.push(params.wifi + '+ Mbps Wi-Fi')
  if (params.booking?.includes('cancellation')) adv.push('free cancellation')
  if (params.booking?.includes('instant')) adv.push('instant book')
  if (adv.length) parts.push(adv.join(', '))

  return parts.join(' · ')
}
