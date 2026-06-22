import type { StyleId } from './types'

export type StyleDef = {
  id: StyleId
  name: string
  tone: string
  asset: string
  thumb: [string, string, string]
}

export const STYLES: StyleDef[] = [
  { id: 'modern', name: 'Modern', tone: 'Clean lines, open spaces', asset: 'style-modern', thumb: ['#E8E4DD', '#C9C3B5', '#9B958A'] },
  { id: 'scandinavian', name: 'Scandinavian', tone: 'Wood, white, quiet', asset: 'style-scandinavian', thumb: ['#5B7B8A', '#3F5A66', '#243842'] },
  { id: 'traditional', name: 'Traditional', tone: 'Classic, layered, period detail', asset: 'style-traditional', thumb: ['#E8B8D0', '#D896B5', '#B26B92'] },
  { id: 'industrial', name: 'Industrial', tone: 'Brick, steel, loft spaces', asset: 'style-industrial', thumb: ['#D6D0C8', '#4B5458', '#A85F3E'] },
  { id: 'japandi', name: 'Japandi', tone: 'Warm minimal, wood, wabi-sabi', asset: 'style-japandi', thumb: ['#B5AD8D', '#8B8466', '#5D5740'] },
  { id: 'minimalist', name: 'Minimalist', tone: 'Simple, calm, uncluttered', asset: 'style-minimalist', thumb: ['#EEEAE2', '#B9B7AE', '#4D5552'] },
]

// Human-readable labels used in the results context line.
export const STYLE_LABELS: Record<StyleId, string> = {
  modern: 'Modern',
  scandinavian: 'Scandinavian',
  traditional: 'Traditional',
  industrial: 'Industrial',
  japandi: 'Japandi',
  minimalist: 'Minimalist',
}

// Mood tile id → style id (drives both the chat prompt and the soft sort).
export const MOOD_TO_STYLE: Record<string, StyleId> = {
  'sun-soaked': 'minimalist',
  storied: 'japandi',
  buzzing: 'modern',
  wintry: 'scandinavian',
}

// Lightweight keyword → style parser for the AI prompt box.
const STYLE_KEYWORDS: Record<string, StyleId> = {
  modern: 'modern', clean: 'modern',
  scandi: 'scandinavian', scandinavian: 'scandinavian', nordic: 'scandinavian', cabin: 'scandinavian', wood: 'scandinavian',
  traditional: 'traditional', classic: 'traditional', period: 'traditional',
  retro: 'traditional', pink: 'traditional', pastel: 'traditional', deco: 'traditional',
  industrial: 'industrial', loft: 'industrial', warehouse: 'industrial', factory: 'industrial', concrete: 'industrial', steel: 'industrial', brick: 'industrial',
  japandi: 'japandi', 'wabi-sabi': 'japandi', wabi: 'japandi', zen: 'japandi', tatami: 'japandi',
  minimalist: 'minimalist', minimal: 'minimalist', uncluttered: 'minimalist', calm: 'minimalist',
  luxury: 'minimalist', premium: 'minimalist', 'high-end': 'minimalist', villa: 'minimalist',
}

export function parsePrompt(text: string): StyleId | null {
  const lower = text.toLowerCase()
  for (const [keyword, styleId] of Object.entries(STYLE_KEYWORDS)) {
    if (lower.includes(keyword)) return styleId
  }
  return null
}

// SVG markup string for a style thumbnail (rendered via dangerouslySetInnerHTML).
export function styleThumbSVG(s: StyleDef): string {
  const [a, b, c] = s.thumb
  const scenes: Record<StyleId, string> = {
    modern: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect x="18" y="19" width="64" height="46" rx="3" fill="${b}"/><rect x="30" y="29" width="40" height="26" rx="2" fill="${c}"/></svg>`,
    scandinavian: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect y="52" width="100" height="32" fill="${b}"/><rect x="32" y="22" width="36" height="34" rx="3" fill="${c}"/></svg>`,
    traditional: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect x="18" y="18" width="64" height="48" rx="4" fill="${b}"/><rect x="30" y="28" width="10" height="28" rx="2" fill="${c}"/><rect x="60" y="28" width="10" height="28" rx="2" fill="${c}"/></svg>`,
    industrial: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect y="56" width="100" height="28" fill="${b}"/><rect x="16" y="16" width="68" height="44" rx="2" fill="${b}"/><path d="M16 32H84M16 48H84M33 16V60M50 16V60M67 16V60" stroke="${a}" stroke-width="3"/><rect x="20" y="60" width="60" height="8" fill="${c}"/></svg>`,
    japandi: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect y="58" width="100" height="26" fill="${b}"/><rect x="26" y="46" width="48" height="12" rx="2" fill="${c}"/><rect x="44" y="30" width="12" height="16" rx="2" fill="${c}" opacity="0.7"/></svg>`,
    minimalist: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect x="18" y="22" width="64" height="34" rx="3" fill="${b}"/><rect x="30" y="32" width="40" height="14" rx="2" fill="${c}" opacity="0.55"/><path d="M22 64H78" stroke="${c}" stroke-width="4"/></svg>`,
  }
  return scenes[s.id]
}
