import type { StyleId, AmenityId } from './types'
import { CITIES } from './cities'
import { parsePrompt, STYLE_LABELS } from './styles'
import { STAYS } from './stays.data'
import { parseDates } from './parseDates'

export type ParsedChat = {
  where?: string // a covered city name
  notCovered?: string // a real city Ada recognises but doesn't cover yet
  suggestion?: { name: string; covered: boolean } // a likely-misspelled city
  styleSuggestion?: { id: StyleId; label: string } // a likely-misspelled style ("svandinavian")
  area?: string // a neighbourhood / borough within the city (e.g. "Brooklyn")
  checkin?: string // ISO date
  checkout?: string // ISO date
  style?: StyleId
  guests?: number
  maxPrice?: number // nightly budget cap
  wifi?: string // min Wi-Fi tier, e.g. '100' | '250'
  amenities?: AmenityId[] // e.g. ['pool']
  tags?: string[] // setting/vibe, e.g. ['beach']
}

const AMENITY_KEYWORDS: [RegExp, AmenityId][] = [
  [/\bpools?\b/, 'pool'],
  [/\bkitchens?\b/, 'kitchen'],
  [/\bstoves?\b/, 'stove'],
  [/\bparking\b/, 'parking'],
  [/\bgyms?\b/, 'gym'],
  [/\b(?:workspace|desk|office|co-?working)\b/, 'workspace'],
  [/\b(?:washer|washing machine|laundry)\b/, 'washer'],
  [/(?<!hair )\bdryer\b|\btumble dryer\b/, 'dryer'],
  [/\bbalcon(?:y|ies)\b/, 'balcony'],
  [/\b(?:air[- ]?conditioning|aircon|a\/c|ac)\b/, 'ac'],
  [/\bheating\b/, 'heating'],
  [/\b(?:tv|television)\b/, 'tv'],
  [/\b(?:hair ?dryer)\b/, 'hairdryer'],
  [/\biron\b/, 'iron'],
]

// Coastal language → the "beach" setting tag.
const BEACH_RE =
  /\b(?:beach(?:front)?|ocean(?:front)?|sea(?:side|front|shore)?|coast(?:al|line)?|shore|surf(?:ing)?|sand(?:y)?|waterfront)\b/

// Neighbourhood / area tokens per city, derived from the stay data's `loc`
// fields (minus the city name itself). Lets "only Brooklyn" filter to Brooklyn.
const AREAS_BY_CITY: Record<string, string[]> = {}
for (const s of STAYS) {
  const tokens = s.loc.split(',').map((t) => t.trim())
  const areas = tokens.filter((t) => t.toLowerCase() !== s.city.toLowerCase())
  AREAS_BY_CITY[s.city] ??= []
  for (const a of areas) if (!AREAS_BY_CITY[s.city].includes(a)) AREAS_BY_CITY[s.city].push(a)
}

// Well-known destinations Ada does NOT cover. Lets the parser tell "a city we
// don't serve yet" (→ honest message) apart from "just a vibe" (→ vibe search).
// Names that collide with common English words (Nice, Split, Bath…) are omitted
// to avoid false positives.
const UNCOVERED_CITIES = [
  'Kyoto', 'Lisbon', 'Marrakech', 'Cape Town', 'Panama City', 'Heidelberg', 'Medellin',
  'London', 'Rome', 'Madrid', 'Amsterdam', 'Budapest', 'Prague', 'Vienna',
  'Milan', 'Venice', 'Naples', 'Athens', 'Istanbul', 'Dublin', 'Edinburgh', 'Porto',
  'Seville', 'Valencia', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Copenhagen',
  'Stockholm', 'Oslo', 'Helsinki', 'Zurich', 'Geneva', 'Brussels', 'Bruges', 'Warsaw',
  'Krakow', 'Dubrovnik', 'Santorini', 'Mykonos', 'Lyon', 'Bordeaux', 'Marseille',
  'Bologna', 'Turin', 'Verona', 'Bilbao', 'Granada', 'Malaga', 'Salzburg',
  'Ljubljana', 'Tallinn', 'Riga', 'Bucharest', 'Sofia', 'Belgrade', 'Zagreb', 'Palermo',
  'Los Angeles', 'San Francisco', 'Chicago', 'Miami', 'Boston', 'Seattle', 'Portland',
  'Denver', 'Austin', 'Nashville', 'New Orleans', 'Las Vegas', 'San Diego', 'Washington',
  'Philadelphia', 'Atlanta', 'Honolulu', 'Toronto', 'Vancouver', 'Montreal', 'Quebec',
  'Rio de Janeiro', 'Sao Paulo', 'Buenos Aires', 'Lima', 'Cusco', 'Santiago', 'Bogota',
  'Cartagena', 'Havana', 'Cancun', 'Oaxaca', 'Guadalajara', 'Quito',
  'Bangkok', 'Chiang Mai', 'Phuket', 'Singapore', 'Hong Kong', 'Seoul', 'Beijing',
  'Shanghai', 'Osaka', 'Taipei', 'Hanoi', 'Jakarta', 'Kuala Lumpur', 'Manila', 'Delhi',
  'Mumbai', 'Jaipur', 'Goa', 'Kathmandu', 'Colombo', 'Dubai', 'Abu Dhabi', 'Doha',
  'Tel Aviv', 'Jerusalem', 'Amman', 'Cairo', 'Nairobi', 'Zanzibar', 'Johannesburg',
  'Casablanca', 'Sydney', 'Melbourne', 'Auckland', 'Queenstown',
]

// Whole-word, case-insensitive match (so "bali" doesn't fire on "balinese",
// and "nice"-style adjectives can't be mistaken for a city).
function mentions(text: string, name: string): boolean {
  const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`).test(text)
}

// Words that are never a destination — measure words, style keywords, and
// common travel filler — so fuzzy matching never offers "did you mean…" for
// them (e.g. "quiet" must not suggest "Quito").
const FUZZY_STOPWORDS = new Set([
  'people', 'person', 'persons', 'guest', 'guests', 'adult', 'adults', 'pax', 'kids', 'child',
  'children', 'night', 'nights', 'week', 'weeks', 'month', 'months', 'day', 'days', 'under',
  'below', 'less', 'than', 'about', 'around', 'over', 'max', 'maximum', 'budget', 'cheap',
  'cheaper', 'price', 'with', 'without', 'near', 'from', 'some', 'somewhere', 'place', 'places',
  'stay', 'stays', 'trip', 'need', 'want', 'looking', 'find', 'show', 'something', 'anywhere',
  'modern', 'contemporary', 'minimalist', 'minimal', 'uncluttered', 'clean', 'scandi', 'scandinavian', 'nordic', 'cabin', 'wood',
  'traditional', 'classic', 'period', 'retro', 'pastel', 'deco', 'farmhouse', 'rustic', 'country', 'stone', 'tuscan',
  'industrial', 'loft', 'warehouse', 'factory', 'concrete', 'steel', 'brick',
  'ornate', 'mosaic', 'luxury', 'premium', 'villa', 'beach', 'ocean', 'mountain', 'mountains',
  'city', 'downtown', 'central', 'cozy', 'quiet', 'dreamy', 'sunny', 'warm', 'cold', 'snow',
  'romantic', 'family', 'friends', 'solo', 'couple', 'weekend', 'holiday', 'vacation', 'summer',
  'winter', 'spring', 'autumn', 'january', 'february', 'march', 'april', 'june', 'july', 'august',
  'september', 'october', 'november', 'december', 'pool', 'wifi', 'apartment', 'house',
])

// Damerau–Levenshtein (optimal string alignment) edit distance — counts an
// adjacent transposition ("toyko"↔"tokyo", "Barcleona"↔"Barcelona") as a single
// edit, not two — bailing out once it exceeds `max`.
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prevPrev: number[] = new Array(b.length + 1).fill(0)
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prevPrev[j - 2] + cost) // adjacent transposition
      }
      curr.push(v)
      if (v < best) best = v
    }
    if (best > max) return max + 1
    prevPrev = prev
    prev = curr
  }
  return prev[b.length]
}

// All recognised cities, covered first (so a tie prefers a covered city).
const ALL_KNOWN: { name: string; covered: boolean }[] = [
  ...CITIES.map((c) => ({ name: c.name, covered: true })),
  ...UNCOVERED_CITIES.map((n) => ({ name: n, covered: false })),
]

// Find the closest city to any word / two-word phrase in the text — a likely
// typo (e.g. "budepest" → Budapest, "barcalona" → Barcelona).
function closestCity(lower: string): { name: string; covered: boolean } | null {
  const words = lower
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const candidates: string[] = []
  for (let i = 0; i < words.length; i++) {
    if (words[i].length >= 4 && !FUZZY_STOPWORDS.has(words[i])) candidates.push(words[i])
    if (i + 1 < words.length) candidates.push(words[i] + ' ' + words[i + 1])
  }

  let best: { name: string; covered: boolean; dist: number } | null = null
  for (const cand of candidates) {
    for (const c of ALL_KNOWN) {
      const target = c.name.toLowerCase()
      if (Math.abs(cand.length - target.length) > 2) continue
      // Tighter threshold for short names so "tokio"→Tokyo works but "quiet"
      // can't reach "Quito".
      const thr = target.length <= 5 ? 1 : 2
      const d = editDistance(cand, target, thr)
      if (d > 0 && d <= thr && (!best || d < best.dist)) {
        best = { name: c.name, covered: c.covered, dist: d }
      }
    }
  }
  return best ? { name: best.name, covered: best.covered } : null
}

// Canonical style words to catch typos of (e.g. "svandinavian" → scandinavian).
// Only used as a fallback when no exact style keyword matched.
const STYLE_TARGETS: [string, StyleId][] = [
  ['scandinavian', 'scandinavian'],
  ['minimalist', 'minimalist'],
  ['traditional', 'traditional'],
  ['industrial', 'industrial'],
  ['japandi', 'japandi'],
  ['modern', 'modern'],
]

// Closest style word to any token in the text — a likely typo. Returns null
// unless a near-miss (edit distance within a length-scaled threshold) is found.
function closestStyle(lower: string): { id: StyleId; label: string } | null {
  const words = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 5)
  let best: { id: StyleId; dist: number } | null = null
  for (const w of words) {
    for (const [name, id] of STYLE_TARGETS) {
      if (Math.abs(w.length - name.length) > 2) continue
      const thr = name.length <= 7 ? 1 : 2 // shorter names need a tighter bar
      const d = editDistance(w, name, thr)
      if (d > 0 && d <= thr && (!best || d < best.dist)) best = { id, dist: d }
    }
  }
  return best ? { id: best.id, label: STYLE_LABELS[best.id] } : null
}

// Lightweight natural-language parser for the AI prompt box. Pulls out a known
// destination, a style keyword, and a guest count so a sentence like
// "2 people, Paris, 1 week in July" actually filters to Paris for 2 guests.
export function parseChat(text: string): ParsedChat {
  const lower = text.toLowerCase()
  const out: ParsedChat = {}

  // Destination — covered cities win (longest name first so "New York" beats a
  // shorter substring). If none match, check whether a city Ada *recognises but
  // doesn't cover* was named, so we can say so instead of substituting others.
  const byLength = [...CITIES].sort((a, b) => b.name.length - a.name.length)
  for (const c of byLength) {
    if (mentions(lower, c.name)) {
      out.where = c.name
      break
    }
  }
  if (!out.where) {
    const uncovered = [...UNCOVERED_CITIES].sort((a, b) => b.length - a.length)
    for (const name of uncovered) {
      if (mentions(lower, name)) {
        out.notCovered = name
        break
      }
    }
  }
  // No exact destination — look for a likely typo before falling back to a
  // vibe search, so "Budepest" suggests Budapest instead of returning Tokyo.
  if (!out.where && !out.notCovered) {
    const guess = closestCity(lower)
    if (guess) out.suggestion = guess
  }

  // Neighbourhood / borough — only within a covered city, matched against that
  // city's own areas (longest first, so "West Village" beats a shorter token).
  if (out.where) {
    const areas = [...(AREAS_BY_CITY[out.where] ?? [])].sort((a, b) => b.length - a.length)
    for (const a of areas) {
      if (mentions(lower, a)) {
        out.area = a
        break
      }
    }
  }

  const dates = parseDates(text)
  if (dates) {
    out.checkin = dates.checkin
    out.checkout = dates.checkout
  }

  const style = parsePrompt(text)
  if (style) out.style = style
  else {
    // No exact style matched — offer a "did you mean…" for a likely style typo.
    const styleGuess = closestStyle(lower)
    if (styleGuess) out.styleSuggestion = styleGuess
  }

  // Guest count — "2 people", "4 guests", "3 adults".
  const m = lower.match(/(\d+)\s*(?:people|guests?|adults?|persons?|pax)\b/)
  if (m) {
    const n = parseInt(m[1], 10)
    if (n > 0 && n <= 16) out.guests = n
  }

  // Budget cap — "under $200", "below 200", "less than $200", "$200 a night",
  // "max $200", "up to $200". The "a/per night" and currency cues keep this
  // from mistaking "14 nights" for a price.
  const priceMatch =
    lower.match(/(?:under|below|less than|max(?:imum)?|up to|no more than|cheaper than)\s*\$?\s*(\d{2,6})/) ||
    lower.match(/\$\s*(\d{2,6})\s*(?:\/|a|per)\s*nights?/) ||
    lower.match(/(\d{2,6})\s*(?:\/|a|per)\s*night/) ||
    lower.match(/\$\s*(\d{2,6})\b/)
  if (priceMatch) {
    const p = parseInt(priceMatch[1], 10)
    if (p > 0) out.maxPrice = p
  }

  // Amenities — "with a pool", "hot tub", "parking"…
  const amenities: AmenityId[] = []
  for (const [re, id] of AMENITY_KEYWORDS) if (re.test(lower)) amenities.push(id)
  if (amenities.length) out.amenities = amenities

  // Setting — "beach", "ocean", "by the sea" → only coastal stays.
  if (BEACH_RE.test(lower)) out.tags = ['beach']

  // Wi-Fi — "fast wifi", "to work", "digital nomad" imply a connection floor.
  if (/\b(?:fibre|fiber|gigabit|fastest|blazing(?:[- ]fast)?)\b/.test(lower)) out.wifi = '250'
  else if (
    /\b(?:fast|strong|reliable|good|high[- ]?speed|great)\s+(?:wi-?fi|internet|connection)\b/.test(lower) ||
    /\b(?:wi-?fi|internet)\s+to work\b/.test(lower) ||
    /\b(?:digital nomad|remote work|work from home|workcation|work-friendly)\b/.test(lower)
  )
    out.wifi = '100'

  return out
}
