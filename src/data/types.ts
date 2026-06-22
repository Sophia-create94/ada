// ============================================================
// Shared data-layer types for Ada's mock stay database.
// ============================================================

export type StyleId =
  | 'modern'
  | 'scandinavian'
  | 'traditional'
  | 'industrial'
  | 'japandi'
  | 'minimalist'

export type AmenityId =
  | 'pool'
  | 'workspace'
  | 'washer'
  | 'dryer'
  | 'kitchen'
  | 'stove'
  | 'ac'
  | 'heating'
  | 'parking'
  | 'tv'
  | 'hairdryer'
  | 'iron'
  | 'balcony'
  | 'gym'

export type BookingTag = 'cancellation' | 'instant' | 'selfcheckin' | 'superhost' | 'petsallowed'

export type AccessId = 'stepfree' | 'wideentrance' | 'stepfreeshower' | 'grabbars'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SEK'

export type Stay = {
  id: string
  name: string
  city: string // matches a WHERE param city exactly
  loc: string // "neighbourhood, city"
  style: StyleId
  specs: string // "2 bedrooms · 1 bath · 4 guests"
  maxGuests: number
  priceDisplay: string // "$245" or "€245"
  priceValue: number // 245
  rating: number // 4.92
  reviews: number // 203
  wifiSpeed: number // Mbps
  amenities: AmenityId[]
  booking: BookingTag[]
  access?: AccessId[] // accessibility features
  tags?: string[] // setting/vibe tags, e.g. 'beach'
  moods?: string[] // mood-tile ids this stay fits, e.g. 'wintry'
  source: string
  sourceUrl: string
  why: string // one sentence — Ada's reason for this pick
  image: string // asset slug, e.g. "ada-ny-dumbo-loft"
}

// Parsed/normalised query params the results page works with.
export type ResultsParams = {
  via: 'filters' | 'chat' | 'mood'
  where?: string // city name or 'flexible'
  area?: string // a neighbourhood / borough within the city
  notCovered?: string // a recognised city Ada doesn't serve yet
  suggest?: string // a likely-misspelled city to suggest
  suggestCovered?: boolean // whether the suggested city is one Ada covers
  checkin?: string
  checkout?: string
  guests?: number
  infants?: number
  pets?: number
  minPrice?: number // nightly price floor — canonical USD
  maxPrice?: number // nightly price cap — canonical USD
  style?: StyleId
  styleSuggest?: string // a likely-misspelled style id, for a "did you mean…" prompt
  wifi?: string // 'any' | '25' | '100' | '250'
  reviews?: string // 'any' | '10' | '50' | '100' | '500'
  rating?: string // 'any' | '4.0' | '4.5' | '4.8'
  amenities?: AmenityId[]
  booking?: BookingTag[]
  access?: AccessId[] // accessibility features
  tags?: string[] // setting/vibe tags, e.g. 'beach'
  q?: string
  mood?: string
}
