import type { StyleId, AmenityId, BookingTag } from '../../data/types'

export type WhereSel = { name: string; country: string | null; flexible?: boolean } | null
export type WhenSel = { start: Date | null; end: Date | null }
export type WhoSel = { adults: number; children: number; infants: number; pets: number }

export type Advanced = {
  wifiSpeed: string // 'any' | '25' | '100' | '250'
  minReviews: string // 'any' | '10' | '50' | '100' | '500'
  minRating: string // 'any' | '4.0' | '4.5' | '4.8'
  amenities: AmenityId[]
  booking: BookingTag[]
}

export type FilterType = 'where' | 'when' | 'who' | 'style'

export type { StyleId, AmenityId, BookingTag }
