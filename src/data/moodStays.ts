import { MOOD_IMAGES } from './moodImages'
import { CITIES } from './cities'
import type { Stay, StyleId, Currency, AmenityId, BookingTag } from './types'

// Mood results are built ENTIRELY from the curated images: the <style>__<city> filename
// is the source of truth for style + city + name, and everything else (price, rating,
// wifi, why…) is mock data derived deterministically from the filename. The whole app is
// fictitious, so this keeps the card looking like a real stay while staying truthful to
// the image's name.

const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.name.toLowerCase().replace(/ /g, '-'), c]))

// Local currency by country (matches how the real mock stays are priced).
const CURRENCY_BY_COUNTRY: Record<string, Currency> = {
  Japan: 'JPY',
  Germany: 'EUR', France: 'EUR', Spain: 'EUR', Italy: 'EUR',
  Iceland: 'EUR', Finland: 'EUR', Portugal: 'EUR',
  Sweden: 'SEK',
}
const SYMBOL: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', SEK: 'kr' }

// Header = a short FICTIVE name only: an evocative word + a neutral type. No city
// (it's in the subheader) and no style word (it's the style tag). e.g. "Library Flat".
const TYPES = ['Flat', 'Apartment', 'Studio', 'Suite', 'House', 'Hideaway', 'Place', 'Nook']
const NAMES = [
  'Library', 'Garden', 'Lantern', 'Olive', 'Linen', 'Maple', 'Skylight', 'Courtyard',
  'Atelier', 'Willow', 'Copper', 'Ivy', 'Cedar', 'Marble', 'Saffron', 'Almond',
  'Poppy', 'Indigo', 'Juniper', 'Hazel',
]
const WHY: Record<StyleId, (c: string) => string> = {
  modern: (c) => `Clean lines, open space and floor-to-ceiling light in the heart of ${c}.`,
  scandinavian: (c) => `Pale wood, white walls and a calm, hygge feel a short walk from central ${c}.`,
  traditional: (c) => `Period detail and classic character in a storied corner of ${c}.`,
  industrial: (c) => `Exposed brick, steel and big windows in a converted space in ${c}.`,
  japandi: (c) => `Warm wood and quiet, wabi-sabi minimalism in a leafy part of ${c}.`,
  minimalist: (c) => `Pared-back, uncluttered calm with everything you need in ${c}.`,
}
const AMENITIES: AmenityId[] = ['kitchen', 'workspace', 'ac', 'heating', 'hairdryer', 'iron']
const BOOKING: BookingTag[] = ['instant', 'cancellation', 'selfcheckin']

// Stable FNV-ish hash so each image always gets the same mock numbers.
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export type MoodStay = { stay: Stay; imageSrc: string }

export function moodStays(moodId: string): MoodStay[] {
  return (MOOD_IMAGES[moodId] ?? []).map((src) => {
    const file = (src.split('/').pop() ?? '').replace(/\.jpg$/, '')
    const [styleId, citySlug = ''] = file.split('__') as [StyleId, string]
    const c = CITY_BY_SLUG.get(citySlug)
    const city = c ? c.name : citySlug.replace(/-/g, ' ')
    const country = c ? c.country : ''
    const cur: Currency = (country && CURRENCY_BY_COUNTRY[country]) || 'USD'
    const h = hash(file)

    let priceValue: number
    let priceDisplay: string
    if (cur === 'JPY') {
      priceValue = 28000 + (h % 28) * 1000
      priceDisplay = '¥' + priceValue.toLocaleString('en-US')
    } else if (cur === 'SEK') {
      priceValue = 1800 + (h % 18) * 100
      priceDisplay = 'kr' + priceValue.toLocaleString('en-US')
    } else {
      priceValue = 110 + (h % 34) * 10 // 110–450
      priceDisplay = SYMBOL[cur] + priceValue
    }

    const beds = 1 + (h % 3)
    const baths = 1 + ((h >> 3) % 2)
    const guests = beds * 2
    const stay: Stay = {
      id: `mood-${moodId}-${file}`,
      name: `${NAMES[h % NAMES.length]} ${TYPES[(h >> 5) % TYPES.length]}`,
      city,
      loc: city,
      style: styleId,
      specs: `${beds} ${beds > 1 ? 'bedrooms' : 'bedroom'} · ${baths} ${baths > 1 ? 'baths' : 'bath'} · ${guests} guests`,
      maxGuests: guests,
      priceDisplay,
      priceValue,
      rating: Number((4.8 + (h % 18) / 100).toFixed(2)),
      reviews: 60 + (h % 180),
      wifiSpeed: [80, 110, 180, 260, 340, 420][h % 6],
      amenities: AMENITIES,
      booking: BOOKING,
      moods: [moodId],
      source: 'Airbnb',
      sourceUrl: 'https://airbnb.com',
      why: (WHY[styleId] ?? ((x: string) => `A characterful space in ${x}.`))(city),
      image: file,
    }
    return { stay, imageSrc: src }
  })
}
