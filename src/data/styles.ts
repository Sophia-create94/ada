import type { StyleId } from './types'

export type StyleDef = {
  id: StyleId
  name: string
  tone: string
  thumb: [string, string, string]
}

export const STYLES: StyleDef[] = [
  { id: 'modern', name: 'Modern', tone: 'Clean lines, open spaces', thumb: ['#E8E4DD', '#C9C3B5', '#9B958A'] },
  { id: 'scandinavian', name: 'Scandinavian', tone: 'Wood, white, quiet', thumb: ['#5B7B8A', '#3F5A66', '#243842'] },
  { id: 'vintage', name: 'Vintage', tone: 'Pastel, period detail', thumb: ['#E8B8D0', '#D896B5', '#B26B92'] },
  { id: 'farmhouse', name: 'Farmhouse', tone: 'Rustic, stone, country', thumb: ['#8B6F47', '#6B5436', '#A6845A'] },
  { id: 'art-nouveau', name: 'Art nouveau', tone: 'Ornate, curves, mosaic', thumb: ['#B5AD8D', '#8B8466', '#5D5740'] },
  { id: 'modern-luxury', name: 'Modern luxury', tone: 'Terra cotta, sunsets', thumb: ['#1F2E22', '#2D4030', '#E8D896'] },
]

// Human-readable labels used in the results context line.
export const STYLE_LABELS: Record<StyleId, string> = {
  modern: 'Modern',
  scandinavian: 'Scandinavian',
  vintage: 'Vintage',
  farmhouse: 'Farmhouse',
  'art-nouveau': 'Art nouveau',
  'modern-luxury': 'Modern luxury',
}

// Mood tile id → style id (drives both the chat prompt and the soft sort).
export const MOOD_TO_STYLE: Record<string, StyleId> = {
  'sun-soaked': 'modern-luxury',
  storied: 'art-nouveau',
  dreamy: 'vintage',
  buzzing: 'modern',
  wintry: 'farmhouse',
  quiet: 'scandinavian',
}

// Lightweight keyword → style parser for the AI prompt box.
const STYLE_KEYWORDS: Record<string, StyleId> = {
  modern: 'modern', contemporary: 'modern', clean: 'modern',
  scandi: 'scandinavian', scandinavian: 'scandinavian', nordic: 'scandinavian', cabin: 'scandinavian', wood: 'scandinavian',
  vintage: 'vintage', retro: 'vintage', pink: 'vintage', pastel: 'vintage', deco: 'vintage',
  farmhouse: 'farmhouse', rustic: 'farmhouse', country: 'farmhouse', stone: 'farmhouse', tuscan: 'farmhouse',
  'art nouveau': 'art-nouveau', 'art-nouveau': 'art-nouveau', ornate: 'art-nouveau', mosaic: 'art-nouveau',
  luxury: 'modern-luxury', premium: 'modern-luxury', 'high-end': 'modern-luxury', villa: 'modern-luxury',
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
    vintage: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect x="18" y="18" width="64" height="48" rx="4" fill="${b}"/><rect x="30" y="28" width="10" height="28" rx="2" fill="${c}"/><rect x="60" y="28" width="10" height="28" rx="2" fill="${c}"/></svg>`,
    farmhouse: `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect y="58" width="100" height="26" fill="${b}"/><polygon points="22,58 50,18 78,58" fill="${c}"/><rect x="46" y="42" width="8" height="16" fill="${b}"/></svg>`,
    'art-nouveau': `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect x="18" y="18" width="64" height="48" rx="6" fill="${b}"/><path d="M32 66 V44 Q32 32 50 32 Q68 32 68 44 V66 Z" fill="${c}"/></svg>`,
    'modern-luxury': `<svg viewBox="0 0 100 84" preserveAspectRatio="xMidYMid slice"><rect width="100" height="84" fill="${a}"/><rect x="14" y="20" width="72" height="44" rx="3" fill="${b}"/><rect x="24" y="30" width="52" height="24" rx="2" fill="${c}" opacity="0.6"/></svg>`,
  }
  return scenes[s.id]
}
