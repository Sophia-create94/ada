import type { Stay, Currency } from './types'

// Mock static FX rates — USD per 1 unit of the currency. (Real app: live rates.)
const USD_PER: Record<Currency, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0066,
  SEK: 0.094,
}

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  SEK: 'kr',
}

// Currencies offered in the header/footer picker — every local currency Ada uses
// (¥ for Tokyo, kr for Kiruna, € and $ elsewhere) is selectable.
export const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'SEK']

const SYMBOL_TO_CURRENCY: Record<string, Currency> = {
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  kr: 'SEK',
}

// A stay's local currency, read from its priceDisplay symbol.
export function stayLocalCurrency(stay: Stay): Currency {
  const sym = stay.priceDisplay.match(/^[^\d]+/)?.[0]?.trim() ?? '$'
  return SYMBOL_TO_CURRENCY[sym] ?? 'USD'
}

// Convert a raw amount between currencies.
export function convert(value: number, from: Currency, to: Currency): number {
  return (value * USD_PER[from]) / USD_PER[to]
}

// A stay's nightly price expressed in the chosen display currency.
export function priceInCurrency(stay: Stay, cur: Currency): number {
  return convert(stay.priceValue, stayLocalCurrency(stay), cur)
}

// "$320", "€1,240" — rounded, grouped, no decimals.
export function formatPrice(value: number, cur: Currency): string {
  return `${CURRENCY_SYMBOL[cur]}${Math.round(value).toLocaleString('en-US')}`
}
