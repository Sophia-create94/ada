// ============================================================
// Fetch matched, de-duplicated photos from Pexels:
//   • one per stay  -> public/assets/<style>/<slug>.jpg   (landscape)
//   • one per mood  -> public/assets/mood-<id>.jpg        (portrait)
//
//   1. Get a free key at https://www.pexels.com/api/  (1-min signup)
//   2. PEXELS_API_KEY=your_key node scripts/fetch-images.mjs
//
// Re-running skips files that already exist (resumes after a rate limit).
// To re-fetch specific images, pass their slugs (this OVERWRITES them):
//   PEXELS_API_KEY=key node scripts/fetch-images.mjs mood-dreamy ada-tu-beachfront-casa
// To re-fetch a style tile and every result-card image for that style, pass the style id:
//   PEXELS_API_KEY=key node scripts/fetch-images.mjs minimalist
// To pin a better search for one image, add it to OVERRIDES below.
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'

const KEY = process.env.PEXELS_API_KEY
if (!KEY) {
  console.error('Missing PEXELS_API_KEY. Run:  PEXELS_API_KEY=your_key node scripts/fetch-images.mjs')
  process.exit(1)
}

let src = readFileSync('src/data/stays.data.ts', 'utf8')
src = src.replace(/import type[^\n]*\n/, '').replace(/export const STAYS: Stay\[\]\s*=/, 'const STAYS =')
const STAYS = eval(src + '\nSTAYS')

const OUT = 'public/assets'
mkdirSync(OUT, { recursive: true })

// Stay photos are grouped into per-style folders (public/assets/<style>/<slug>.jpg);
// mood/style tiles stay at the root. destFor() returns the right path for a target.
const destFor = (t) =>
  t.kind === 'stay' ? `${OUT}/${t.stay.style}/${t.slug}.jpg` : `${OUT}/${t.slug}.jpg`

// Queries lean on "living room / furnished / cozy / hotel suite" so Pexels
// returns lived-in, furnished spaces — not empty, staged-for-sale rooms.
const STYLE_QUERY = {
  modern: 'modern living room furnished',
  scandinavian: 'scandinavian furnished living room sofa light wood',
  traditional: 'traditional classic living room',
  industrial: 'industrial loft living room brick steel',
  japandi: 'japandi interior living room warm wood minimal',
  minimalist: 'minimalist apartment interior living room',
}

const MOOD_QUERIES = {
  'sun-soaked': ['tropical beach sunset', 'sun-soaked beach palm', 'turquoise ocean beach'],
  storied: ['historic stone alley', 'ancient riad courtyard', 'old town narrow street'],
  dreamy: ['misty countryside dawn', 'dreamy soft light landscape', 'foggy meadow morning'],
  nature: ['lush green jungle forest', 'misty mountain forest river', 'tropical rainforest canopy'],
  buzzing: ['vibrant city street night', 'busy city street cafe', 'neon city street'],
  wintry: ['snowy cabin mountains', 'winter snow forest cabin', 'snowy alpine village'],
  quiet: ['quiet forest cabin', 'calm nature lake retreat', 'serene misty forest'],
}

// Pin a specific search for any slug here when you want to swap one out.
// (These replace images flagged as empty / for-sale / off-theme.)
const OVERRIDES = {
  'ada-bc-barceloneta-beach': 'bright furnished studio apartment',
  'ada-ct-constantia-farmstead': 'farmhouse living room fireplace',
  'ada-ny-harlem-rowhouse': 'brownstone living room interior',
  'ada-ro-aurora-glass-igloo': 'modern glass cabin bedroom interior furnished wide angle',
  'ada-ro-town-studio': 'modern studio apartment cozy interior',
  'ada-ki-lakeside-cabin': 'scandinavian cabin living room sofa light wood furnished wide angle',
  // ---- requested swaps: no people, interiors / Tulum-style beach ----
  'mood-sun-soaked': 'tropical beach turquoise ocean palm',
  'mood-quiet': 'serene misty forest lake calm',
  'ada-tk-ginza-suite': 'modern minimalist living room interior',
  'ada-ro-pine-log-cabin': 'scandinavian furnished living room interior wide angle',
  'ada-re-harbour-house': 'scandinavian cottage living room sofa light wood furnished wide angle',
  'ada-mx-san-angel-villa': 'traditional furnished apartment living room interior wide angle',
  'ada-li-lx-factory-loft': 'industrial loft living room interior',
  'ada-re-perlan-penthouse': 'modern living room sofa warm wood cozy interior',
  'ada-ki-aurora-cabin': 'scandinavian cabin bedroom white bedding light wood furnished wide angle',

  // ---- minimalist result-card refreshes ----
  'ada-tk-shibuya-skyloft': 'minimalist furnished apartment living room interior wide angle',
  'ada-tk-roppongi-penthouse': 'minimalist furnished apartment living room interior wide angle',
  'ada-pa-tuileries-suite': 'minimalist apartment interior living room',
  'ada-ny-tribeca-penthouse': 'minimalist furnished apartment living room interior wide angle',
  'ada-li-belem-villa': 'minimalist apartment interior living room',
  'ada-tu-aldea-casa': 'minimalist bedroom made bed white bedding furnished apartment interior wide angle',
  'ada-ma-palmeraie-villa': 'minimalist furnished apartment living room interior wide angle',
  'ada-ma-atlas-retreat': 'minimalist earth tone apartment interior',
  'ada-re-hallgrimskirkja-flat': 'minimalist apartment interior living room',
  'ada-fl-duomo-attico': 'minimalist apartment interior living room',
  'ada-fl-fiesole-villa': 'minimalist furnished apartment living room interior wide angle',
  'ada-ct-camps-bay-bungalow': 'minimalist apartment interior bedroom',
  'ada-fl-santacroce-flat': 'minimalist apartment interior living room',
  'ada-ba-seminyak-villa': 'minimalist apartment interior living room',
  'ada-bc-tibidabo-villa': 'minimalist apartment interior living room',
  'ada-ro-wilderness-villa': 'minimalist apartment interior living room',
  'ada-ki-tundra-lodge': 'minimalist living room sofa warm wood cozy interior',
  'ada-li-principe-real-flat': 'elegant classic apartment living room furnished soft ornate wide angle',
}

const MOODS = ['sun-soaked', 'storied', 'dreamy', 'nature', 'buzzing', 'wintry', 'quiet']

// Style-picker tile photos — each must clearly read as that aesthetic.
const STYLE_PHOTO_QUERIES = {
  modern: ['minimalist modern interior design', 'modern architectural living space'],
  scandinavian: ['scandinavian interior design hygge', 'nordic minimalist living room'],
  traditional: ['traditional interior design living room', 'classic period apartment interior'],
  industrial: ['industrial loft interior brick steel', 'warehouse loft living room concrete'],
  japandi: ['japandi interior design', 'japandi living room warm wood', 'wabi sabi minimalist interior'],
  minimalist: ['minimalist apartment interior living room', 'minimalist warm apartment interior'],
}
const STYLES = ['modern', 'scandinavian', 'traditional', 'industrial', 'japandi', 'minimalist']
const STYLE_ASSET = {
  modern: 'style-modern',
  scandinavian: 'style-scandinavian',
  traditional: 'style-traditional',
  industrial: 'style-industrial',
  japandi: 'style-japandi',
  minimalist: 'style-minimalist',
}
const targets = [
  ...STAYS.map((s) => ({ slug: s.image, kind: 'stay', stay: s })),
  ...MOODS.map((id) => ({ slug: `mood-${id}`, kind: 'mood', moodId: id })),
  ...STYLES.map((id) => ({ slug: STYLE_ASSET[id], kind: 'style', styleId: id })),
]

function queriesFor(t) {
  if (OVERRIDES[t.slug]) return [OVERRIDES[t.slug]]
  if (t.kind === 'mood') return MOOD_QUERIES[t.moodId]
  if (t.kind === 'style') return STYLE_PHOTO_QUERIES[t.styleId]
  if (t.stay.tags?.includes('beach'))
    return ['beach villa interior furnished', 'tropical resort suite interior', 'oceanfront villa terrace pool', 'beach house living room']
  const base = STYLE_QUERY[t.stay.style] || 'cozy furnished living room'
  const styleWord = t.stay.style.replace('-', ' ')
  // Style-rich queries first (so the style gate has on-style candidates), then one
  // generic furnished fallback so we never come up empty.
  return [base, `${base} interior design`, `${styleWord} apartment interior`, 'furnished apartment living room interior']
}

// Seed from any existing credits.json so re-fetching specific slugs (a) never
// reuses a photo another stay already has, and (b) keeps the other credits.
let credits = {}
try { credits = JSON.parse(readFileSync(`${OUT}/credits.json`, 'utf8')) } catch { /* first run */ }
const used = new Set()
for (const c of Object.values(credits)) {
  const id = c.source?.match(/(\d+)\/?$/)?.[1]
  if (id) used.add(Number(id))
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Pexels returns a descriptive page URL + alt text per photo (e.g.
// "empty-modern-house-room-8146330"). Skip anything that reads as an empty /
// for-sale / wrong-room shot so we only ever pick furnished living spaces.
const BAD =
  /empty|vacant|unfurnished|for[- ]sale|under construction|construction site|building site|abandoned|derelict|renovat|\bbare\b|bare mattress|bed frame|without mattress|no mattress|bathroom|toilet|\bgarage\b|hallway|corridor|staircase|warehouse interior|firewood|chopped wood|stack of wood|log basket|woodpile|close[- ]?up|\bdetail\b|\bmacro\b|\bfireplace\b|\bmantel\b|\bhearth\b/i
// Also skip photos that feature people — we want clean interiors/scenes.
const PEOPLE =
  /\b(man|woman|men|women|person|people|girl|boy|child|children|kid|kids|baby|family|couple|guy|lady|ladies|male|female|model|portrait|selfie|human|tourist|guest|wearing|sitting on a|lying on)\b/i
// And skip exterior / scenic shots for stays — the cards want furnished rooms, not
// building facades, snowy huts, fjord villages or aurora skies.
const EXTERIOR =
  /\bexterior\b|facade|aerial|drone|\bscenic\b|northern lights|aurora|borealis|\bnight sky\b|starry sky|\bstars\b|\bvillage\b|\brorbu\b|\bhut\b|house in winter|houses in winter|\bin the snow\b|snow-covered|by the forest|by the lake|by the sea|red (wooden )?(hut|cabin|house|cottage)|mountain view|street view|\brooftop|\bgarden\b|poolside|swimming pool|villa pool|\bpatio\b|backyard|\bterrace\b|\boutdoor\b|\blush\b/i
const looksFurnished = (p, allowExterior = false) => {
  // Normalise slug separators ("house-in-winter" -> "house in winter") so phrase matches hit.
  const text = `${p.url || ''} ${p.alt || ''}`.replace(/[-_]+/g, ' ')
  return !BAD.test(text) && !PEOPLE.test(text) && (allowExterior || !EXTERIOR.test(text))
}

// Positive style gate: a stay's photo should READ as its style. We PREFER a photo whose
// description matches these keywords; only if none turns up across all queries do we fall
// back to any clean interior. This is what keeps "filter: Industrial" actually industrial.
const STYLE_ACCEPT = {
  modern: /\bmodern\b|contemporary|\bsleek\b|minimalist/,
  scandinavian: /scandinav|nordic|hygge|\bscandi\b/,
  traditional: /traditional|\bclassic\b|vintage|antique|period|ornate|rustic|country|\belegant\b/,
  industrial: /industrial|\bloft\b|\bbrick\b|concrete|exposed|warehouse|\bsteel\b|\bmetal\b|factory|\bpipe/,
  japandi: /japandi|wabi.?sabi|\bzen\b|tatami|muji|natural wood|warm minimal/,
  minimalist: /minimalist|\bminimal\b|\bsimple\b|\bclean\b|\bzen\b|scandinav/,
}
const styleMatches = (p, style) => {
  const re = STYLE_ACCEPT[style]
  if (!re) return false
  return re.test(`${p.url || ''} ${p.alt || ''}`.replace(/[-_]+/g, ' '))
}

// A city/skyline window view contradicts calm / nature / cold moods (a "wild" or
// "wintry" stay shouldn't look out onto a summer cityscape). Reject described city
// views for stays whose moods are calm-leaning and not urban. NOTE: the view is often
// NOT in the alt text, so this only catches the described cases — visual review is still
// the backstop for the rest.
const VIEW =
  /city view|cityscape|skyline|downtown|high[- ]?rise|panoram|overlooking the city|urban view|city lights|city skyline|rooftop view|city in the/i
const CALM_MOODS = ['nature', 'wintry', 'quiet', 'dreamy']
const URBAN_MOODS = ['buzzing', 'storied']
const isCalmStay = (t) =>
  t.kind === 'stay' &&
  t.stay.moods?.some((m) => CALM_MOODS.includes(m)) &&
  !t.stay.moods?.some((m) => URBAN_MOODS.includes(m))

async function search(query, page, orientation) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&page=${page}&orientation=${orientation}`
  const res = await fetch(url, { headers: { Authorization: KEY } })
  if (!res.ok) throw new Error(`Pexels ${res.status} for "${query}"`)
  return (await res.json()).photos || []
}

async function downloadTo(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

// Owner's hand-picked images dropped straight into public/assets/. These are NEVER
// (re)fetched — they survive every style / mood / no-arg pass, so a manual pick is never
// overwritten. To hand one back to the script, just remove its slug from this set.
const PINNED = new Set([
  'ada-li-principe-real-flat',
  'ada-ki-lakeside-cabin',
  'ada-ro-pine-log-cabin',
  'ada-ny-soho-studio',
  'ada-pa-saint-germain-flat',
  'ada-ba-uluwatu-cliff',
  'ada-tu-boho-bungalow',
  'ada-ba-sidemen-villa',
  'ada-tu-beachfront-casa',
  'ada-ky-arashiyama-ryokan',
  'ada-mx-polanco-penthouse',
  'ada-ki-town-loft',
  'ada-pa-montmartre-garret',
  'ada-fl-santo-spirito-flat',
  'ada-ki-ski-chalet',
  'ada-ky-philosophers-house',
  'ada-bc-gothic-loft',
  'ada-ky-gion-loft',
  'ada-li-alfama-loft',
  'ada-li-graca-miradouro',
  'ada-ma-kasbah-loft',
  'ada-mx-coyoacan-casa',
])

const only = process.argv.slice(2)
const onlySet = new Set(only)
const styleOnly = new Set(
  only
    .map((arg) => (arg.startsWith('style:') ? arg.slice('style:'.length) : arg))
    .filter((arg) => STYLES.includes(arg)),
)
const work = only.length
  ? targets.filter((t) =>
      onlySet.has(t.slug) ||
      (t.kind === 'style' && styleOnly.has(t.styleId)) ||
      (t.kind === 'stay' && styleOnly.has(t.stay.style)),
    )
  : targets

let ok = 0
for (const t of work) {
  if (PINNED.has(t.slug)) {
    if (onlySet.has(t.slug)) console.log(`⏭ ${t.slug.padEnd(34)} pinned (manual image) — skipped`)
    continue
  }
  const dest = destFor(t)
  if (t.kind === 'stay') mkdirSync(`${OUT}/${t.stay.style}`, { recursive: true })
  if (!only.length && existsSync(dest)) { ok++; continue }

  const orientation = t.kind === 'mood' ? 'portrait' : 'landscape'
  const gateStyle = t.kind === 'stay' ? t.stay.style : null
  const calmStay = isCalmStay(t)
  let picked = null
  let fallback = null // first clean interior, used only if no on-style photo is found
  for (const q of queriesFor(t)) {
    for (let page = 1; page <= 3 && !picked; page++) {
      let photos = []
      try { photos = await search(q, page, orientation) } catch (e) { console.error('  search:', e.message); break }
      if (!photos.length) break
      for (const p of photos) {
        if (used.has(p.id) || !looksFurnished(p, t.kind === 'mood')) continue
        if (calmStay && VIEW.test(`${p.url || ''} ${p.alt || ''}`.replace(/[-_]+/g, ' '))) continue
        if (gateStyle && !styleMatches(p, gateStyle)) { fallback = fallback || p; continue }
        picked = p
        break
      }
      await sleep(150)
    }
    if (picked) break
  }
  const usedFallback = !picked && !!fallback
  picked = picked || fallback

  if (!picked) { console.error('✗ no match for', t.slug); continue }
  used.add(picked.id)
  try {
    await downloadTo(picked.src.large || picked.src.medium, dest)
    credits[t.slug] = { photographer: picked.photographer, source: picked.url }
    ok++
    const tag =
      t.kind === 'mood' ? `mood/${t.moodId}` : t.kind === 'style' ? `style/${t.styleId}` : `${t.stay.city}/${t.stay.style}`
    console.log(`✓ ${t.slug.padEnd(34)} ${tag.padEnd(22)}${usedFallback ? ' ⚠ off-style fallback' : ''} — ${picked.photographer}`)
  } catch (e) {
    console.error('✗ download failed', t.slug, e.message)
  }
  await sleep(200)
}

writeFileSync(`${OUT}/credits.json`, JSON.stringify(credits, null, 2))
console.log(`\nDone — ${ok}/${work.length} images in ${OUT}/ (+ credits.json)`)
