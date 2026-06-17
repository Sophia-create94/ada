# Ada — portfolio prototype

A two-page portfolio site for **Ada**, an AI-powered accommodation meta-search that
returns five curated stays matching your taste instead of hundreds to sift through.

Built with **React + TypeScript + Tailwind CSS + React Router**, bundled by **Vite**.
No backend, no auth, no database — everything runs on static mock data so a recruiter
can click through end to end.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Pages

- `/` — landing page (`src/pages/Home.tsx`): hero with the filter card + AI chat card,
  six mood tiles, features, how-it-works, testimonials, CTA.
- `/results` — results page (`src/pages/Results.tsx`): reads URL query params, picks five
  stays, renders the stay cards + first-visit nudge.

## How it fits together

- **Design system** — `src/index.css` holds the full ochre design system (tokens, every
  component style), ported 1:1 from the reference HTML. Tailwind tokens mirror it in
  `tailwind.config.js`.
- **Data layer** — `src/data/stays.data.ts` is the 65-stay database (5 per city × 13
  cities). `src/data/stays.ts` exposes `pickStays()` (filter → soft-sort by style →
  never fewer than five) and `buildContextLine()`.
- **Search card** — `src/components/search/` implements the WHERE / WHEN / WHO / STYLE
  popovers, advanced filters, and the navigation to `/results` with the selected state as
  URL query params.
- **User state** — new visitors see the nudge block and "Ada's pick #N" badges. Flip
  `IS_LOGGED_IN` in `src/pages/Results.tsx` to preview the logged-in state (no nudge,
  "% match" badges).

## Deploy (GitHub + Vercel)

```bash
git init && git add . && git commit -m "initial Ada build"
git remote add origin https://github.com/<username>/ada-portfolio.git
git push -u origin main
```

In Vercel: New Project → Import `ada-portfolio` → framework preset **Vite**, build
`npm run build`, output `dist`. `vercel.json` already rewrites all routes to
`index.html` so `/results` doesn't 404 on direct load or refresh.
