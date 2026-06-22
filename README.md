# Ada 🏡

> An AI-powered stay finder that returns **five taste-matched places to stay** — not hundreds to sift through. Search with filters, plain-English chat, or by browsing interior styles and moods.

**Live demo →** _add your Vercel URL here after deploying_

Ada is a front-end portfolio piece: a polished, clickable prototype of an AI accommodation meta-search (the idea: it scans Airbnb, Booking, Vrbo and others and hands back a short, curated shortlist instead of endless results). I designed the experience and directed AI tooling to build it as a real React app, keeping the product and design judgment for myself.

> **Note:** This is a portfolio prototype with hardcoded sample data — no backend, no auth, no real bookings. Everything runs on static mock data so you can click through the whole flow end to end.

---

## ✨ Highlights

- **Four ways to search** — advanced filters (where · when · who · style), a natural-language chat box, or browse by **interior style** or **mood**.
- **Five picks, not a hundred** — a taste-matched shortlist with a "why Ada picked this" reason on every card.
- **Personalization preview** — an "after sign up" mockup showing how Ada learns from the stays you save, like, skip, and book (taste profile, match scores, rising confidence).
- **Forgiving, honest search** — typo correction ("Did you mean Berlin?"), graceful empty states that name the real constraint, and dates/guest counts that never wrongly zero out results.
- **Multi-currency display** — USD · EUR · GBP · JPY · SEK.
- **Hand-built design system** — an ochre-and-cream palette with every component styled in plain CSS; fully responsive and `prefers-reduced-motion` aware.
- **Stateful navigation** — going back from a result returns you to exactly the section you searched from.

## 🧭 Pages

| Route | Page |
|-------|------|
| `/` | **Home** — hero (filter card + AI chat), browse by style & mood, a personalization preview, how Ada works, and the CTA |
| `/results` | **Results** — the five-stay shortlist built from the URL's search params (filters, chat, a style, or a mood) |

## 🛠 Tech stack

- **[React 18](https://react.dev/)** + **[TypeScript 5](https://www.typescriptlang.org/)** (strict)
- **[React Router v6](https://reactrouter.com/)**
- **[Vite 5](https://vitejs.dev/)**
- **[Tailwind CSS v3](https://tailwindcss.com/)** (PostCSS) alongside a hand-authored CSS design system in [`src/index.css`](src/index.css)
- Deployed on **[Vercel](https://vercel.com/)** (auto-deploy from `main`)

## 🧩 How it fits together

- **Data layer** — [`src/data/stays.data.ts`](src/data/stays.data.ts) holds 60 sample stays across 6 interior styles. [`src/data/stays.ts`](src/data/stays.ts) runs the search: `pickStays()` filters by the hard constraints, soft-sorts by style/mood affinity, and always returns five; `buildContextLine()` writes the results recap.
- **Search input** — [`src/components/search/`](src/components/search/) implements the WHERE / WHEN / WHO / STYLE popovers and advanced filters, then encodes the selection into `/results` query params. [`src/data/parseChat.ts`](src/data/parseChat.ts) turns a plain-English prompt into the same params.
- **Personalization** — new visitors see "Ada's pick #N" badges; flip `IS_LOGGED_IN` in [`src/pages/Results.tsx`](src/pages/Results.tsx) to preview the logged-in state (match-score badges).

## 🚀 Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check + production build (`tsc -b && vite build`) |
| `npm run preview` | Serve the production build |

> The [`scripts/`](scripts/) folder holds one-off asset tooling (Pexels image fetch, mood-image manifest generation, asset reconcile). It isn't needed to run the app — the generated data is already committed.

## 📁 Project structure

```
src/
  main.tsx          # app entry + router (two routes)
  index.css         # the design system — tokens + every component style
  pages/            # Home, Results
  components/       # Header, Footer, BrandMark, StayCard, Moods, HowItWorks, WhyAda, …
    search/         # WHERE / WHEN / WHO / STYLE popovers, advanced filters, the search card
  data/             # stays dataset + search logic, styles, cities, currency, chat/date parsing
  contexts/         # currency context
public/assets/      # stay photos (organised by style) and mood images
scripts/            # asset tooling (Pexels fetch, mood manifest, reconcile)
```

## ☁️ Deployment

Hosted on **Vercel** — import the repo, framework preset **Vite** (build `npm run build`, output `dist`). [`vercel.json`](vercel.json) rewrites all routes to `/index.html`, so `/results` loads and refreshes without a 404. Pushes to `main` deploy automatically.

---

*Designed and built by Sophia Müller — a portfolio prototype, 2026, with AI-assisted development.*
