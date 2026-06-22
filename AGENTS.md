# Ada — project brief for coding agents

Ada is a **two-page portfolio website** for an AI-powered accommodation *meta-search*
(it searches across Airbnb, Booking, Vrbo, Plum Guide, Tablet Hotels, etc. and returns a
short, taste-matched shortlist instead of hundreds of results). It is a front-end
portfolio piece — there is **no backend**; all data is static/mocked.

## Stack & commands
- React 18 + TypeScript (strict, `noUnusedLocals`) + Vite + React Router v6.
- Styling is **plain global CSS** in `src/index.css` (not Tailwind/CSS-modules). Match the
  existing class-based style; most components use semantic class names defined there.
- Commands: `npm run dev` (Vite dev server), `npm run build` (`tsc -b && vite build` — keep
  this green), `npm run preview`.

## Pages
- `src/pages/Home.tsx` — landing page (hero + search/chat cards, moods, features, how-it-works,
  proof, CTA).
- `src/pages/Results.tsx` — search results (5-pick shortlist, filters, account nudge).

## Architecture / key files
- `src/data/stays.data.ts` — the dataset (~75 stays). **Edit data here.** Each stay has a
  `style`, optional `tags`, `access`, and a `moods: string[]` array, plus pricing fields.
- `src/data/stays.ts` — filtering logic. `pickStays(params)` runs the search; `satisfiesHard()`
  is the hard-filter gate (style is hard unless `via === 'mood'`; `mood` is a hard gate against
  `stay.moods`). Soft sorting orders by style/mood affinity.
- `src/data/styles.ts` — the 6 interior styles (modern, scandinavian, traditional, industrial,
  japandi, minimalist) + the SVG thumbnail fallback art.
- `src/data/cities.ts`, `currency.ts`, `images.ts`, `parseChat.ts`, `parseDates.ts`,
  `types.ts` — cities/icons, FX + currency display, image URL resolution, the chat-prompt
  parser, date parsing, shared types.
- `src/components/Moods.tsx` — the mood tiles (the `MOODS` array lives here).
- `src/contexts/CurrencyContext.tsx` — global display-currency state.

## Two concepts that drive the data

### Styles vs moods (keep these distinct)
- **Style** answers *"what does the place look like?"* — the interior aesthetic. It's a hard
  filter (each stay has exactly one `style`).
- **Mood** answers *"what will this trip feel like?"* — derived from **geography + setting +
  climate**, NOT interior style. Moods are **additive** (`moods: string[]`, a stay can have
  several). Current moods: `sun-soaked`, `buzzing`, `nature` (label "Wild"), `dreamy`,
  `storied`, `wintry`, `quiet`. Note the tile order in `Moods.tsx` differs from this list and
  is intentional. `dreamy` = soft/pastoral (vineyards, hills); `nature` = wild green (jungle,
  forest, mountains, reserves) and excludes plain beach + cold cities.

### Two-tier product model (copy must stay accurate to this)
- **No account:** can search via **three entry points** — advanced filters, the chat prompt,
  or tapping a mood card — and gets the 5-pick shortlist.
- **Free account:** all of the above **plus** save/like stays, save style preferences, and
  **personalized** results.
- Therefore: never imply personalization happens without an account, and never imply an account
  is required to search. The save/like/preferred-style features are **described in marketing
  copy only** — they are in-app (logged-in) features and are intentionally **not built** in this
  portfolio. Don't wire up dead save/like controls on the public pages.

## Images
- **Stay** photos are grouped by style: `public/assets/<style>/<slug>.jpg` (e.g.
  `public/assets/japandi/ada-li-principe-real-flat.jpg`). `getImageUrl(stay)` builds the
  path from `stay.style` + `stay.image`, so **a re-style must move the file to the new style
  folder** — run `node scripts/reconcile-assets.mjs` after any style change (it re-files,
  reports orphans/missing).
- **Tiles** stay at the root: moods are `mood-<id>.jpg` (id, not label — the "Wild" tile is
  `mood-nature.jpg`), styles are `style-<id>.jpg`. `public/assets/credits.json` (root,
  slug-keyed) records photographer + source. New images get staged in `public/assets/_incoming/`.
- `scripts/fetch-images.mjs` fetches matched, de-duplicated photos from **Pexels**. Needs
  `PEXELS_API_KEY` in env. No-arg run **skips existing files**; pass slugs (or a bare style id,
  e.g. `industrial`, to do all stays of that style) to **force-overwrite**. Filters: `BAD`
  (empty/for-sale/detail), `PEOPLE`, `EXTERIOR` (facades/scenery/garden — moods exempt), a
  positive `STYLE_ACCEPT` style gate (with fallback), and a `VIEW` city-window gate for calm
  moods. `PINNED` slugs are **never** re-fetched (protects hand-placed images). The owner runs
  this themselves (key stays out of transcripts).
- Components fall back gracefully (placeholder / SVG art) via `onError` when an image is missing.
- Manually-dropped images: keep the **exact slug filename** + `.jpg`, place in the stay's
  **style folder**, add the slug to `PINNED`, and keep them ~1000–1400px (no multi-MB originals).

## Conventions
- TypeScript strict + `noUnusedLocals` — no unused imports/vars or the build fails.
- Keep `npm run build` green before considering a change done.
- Currency filtering is canonical-USD; display conversion only. Picker currencies:
  USD/EUR/GBP/SEK.
- Deployment (GitHub/Vercel) is **reserved for the owner's explicit sign-off** — don't deploy.

## Status
Active portfolio build on `main`. Recent work: mood system (incl. new "Wild"/nature mood),
SEK support, Lapland stays (Rovaniemi/Kiruna), style-picker photos, and landing-page copy
aligned to the two-tier model.
