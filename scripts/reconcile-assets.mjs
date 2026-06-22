// ============================================================
// Keep public/assets tidy: every stay image must live in its STYLE's folder
// (public/assets/<style>/<slug>.jpg). Run this after re-styling a stay — it moves
// any misfiled image into the right folder and reports orphans / missing files.
//
//   node scripts/reconcile-assets.mjs
//
// Mood/style tiles (mood-*.jpg, style-*.jpg) and credits.json stay at the root.
// ============================================================
import { readFileSync, existsSync, mkdirSync, renameSync, readdirSync } from 'fs'

const OUT = 'public/assets'
const src = readFileSync('src/data/stays.data.ts', 'utf8')
const blocks = src.split(/\n  \{\n/).slice(1)
const stays = blocks
  .map((b) => ({
    image: (b.match(/image: '([^']+)'/) || [])[1],
    style: (b.match(/style: '([^']+)'/) || [])[1],
  }))
  .filter((s) => s.image && s.style)

const styles = [...new Set(stays.map((s) => s.style))]
for (const st of styles) mkdirSync(`${OUT}/${st}`, { recursive: true })

// Index where each stay image currently sits (any style folder, or the root).
const searchDirs = [OUT, ...styles.map((st) => `${OUT}/${st}`)]
const locate = (slug) => {
  for (const dir of searchDirs) {
    const p = `${dir}/${slug}.jpg`
    if (existsSync(p)) return p
  }
  return null
}

let moved = 0,
  ok = 0,
  missing = 0
for (const s of stays) {
  const dest = `${OUT}/${s.style}/${s.image}.jpg`
  const cur = locate(s.image)
  if (!cur) {
    console.log('  MISSING', s.image, `(expected ${s.style}/)`)
    missing++
    continue
  }
  if (cur === dest) {
    ok++
    continue
  }
  renameSync(cur, dest)
  console.log(`  moved ${s.image} → ${s.style}/`)
  moved++
}

// Orphans: stay images on disk that no stay references any more.
const known = new Set(stays.map((s) => s.image))
const orphans = []
for (const st of styles) {
  for (const f of readdirSync(`${OUT}/${st}`).filter((f) => f.endsWith('.jpg'))) {
    if (!known.has(f.replace('.jpg', ''))) orphans.push(`${st}/${f}`)
  }
}

console.log(`\nreconciled: ${ok} in place · ${moved} moved · ${missing} missing`)
if (orphans.length) console.log('orphans (no stay references these):', orphans.join(', '))
