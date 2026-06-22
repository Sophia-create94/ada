import { useEffect, useMemo } from 'react'
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StayCard from '../components/StayCard'
import { parseResultsParams, pickStays, buildContextLine, cheapestInScope, formatDateRange } from '../data/stays'
import { CITIES } from '../data/cities'
import { STYLE_LABELS, STYLES } from '../data/styles'
import { moodStays } from '../data/moodStays'
import { CURRENCY_SYMBOL, formatPrice, priceInCurrency, convert } from '../data/currency'
import { useCurrency } from '../contexts/CurrencyContext'

// Portfolio build: default everyone to the new-visitor state. Flip this to true
// to preview the logged-in experience (no nudge block, % match badges).
const IS_LOGGED_IN = false

// Mood id → display word + description, for the results title/subheader
// (mirrors the homepage mood cards).
const MOOD_INFO: Record<string, { word: string; meta: string }> = {
  'sun-soaked': { word: 'Sun-soaked', meta: 'Ocean views · sandy floors · endless summer' },
  buzzing: { word: 'Buzzing', meta: 'City buzz · local crowds · corner cafés' },
  nature: { word: 'Wild', meta: 'Jungle canopy · forest trails · mountain air' },
  storied: { word: 'Storied', meta: 'Ancient walls · local legends · rooms with a past' },
  wintry: { word: 'Wintry', meta: 'Snowed-in cabins · ski slopes · thick blankets' },
}

// Fisher–Yates shuffle (returns a new array) — used to randomise mood images per click.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Results() {
  const [searchParams] = useSearchParams()
  const search = searchParams.toString()
  const location = useLocation()
  const navigate = useNavigate()
  const { currency: cur } = useCurrency()

  // Parse + pick once per URL so "I'm flexible" doesn't reshuffle on re-render.
  const { stays, via, mood, guests, styleSuggest, eyebrow, title, contextText, isChatQuote, emptyMsg, partialNote, showChips, suggestCity, carryQuery } =
    useMemo(() => {
      const p = parseResultsParams(new URLSearchParams(search))
      const picked = pickStays(p)
      const n = picked.length
      const sym = CURRENCY_SYMBOL[cur]
      // Price bounds are canonical USD; show them in the active display currency.
      const dispUsd = (usd: number) => Math.round(convert(usd, 'USD', cur)).toLocaleString('en-US')
      const isChat = p.via === 'chat' || p.via === 'mood'
      const hasFilterInput = Boolean(
        p.where ||
          p.area ||
          p.checkin ||
          p.checkout ||
          p.guests ||
          p.infants ||
          p.pets ||
          p.style ||
          p.minPrice != null ||
          p.maxPrice != null ||
          (p.wifi && p.wifi !== 'any') ||
          (p.reviews && p.reviews !== 'any') ||
          (p.rating && p.rating !== 'any') ||
          p.amenities?.length ||
          p.booking?.length ||
          p.access?.length ||
          p.tags?.length,
      )
      const isEmptyFilterSearch = p.via === 'filters' && !hasFilterInput
      const ctxRaw = buildContextLine(p, cur)
      let ctx = ctxRaw
      if (p.via === 'chat') {
        const trimmed = ctxRaw.length > 200 ? ctxRaw.slice(0, 200) + '…' : ctxRaw
        ctx = trimmed ? `"${trimmed}"` : ''
      } else if (isEmptyFilterSearch) {
        ctx = 'No filters selected yet. Ada is showing a fresh mix across destinations and styles.'
      } else if (!ctx) {
        ctx = "Ada's top picks, sorted by match strength."
      }

      // A likely style typo from the chat ("sandinavian") is surfaced as the
      // headline question — exactly like a city typo — and we show all stays
      // meanwhile, so the two "did you mean…" cases read the same way.
      const styleSuggestLabel = p.styleSuggest
        ? STYLE_LABELS[p.styleSuggest as keyof typeof STYLE_LABELS]
        : ''

      // Count-aware title. Five = the full promise; 1–4 = "fewer is the feature";
      // 0 = an honest empty state (typo / uncovered city / constraints too tight).
      let title: string
      if (p.suggest) title = `Did you mean ${p.suggest}?`
      else if (p.notCovered) title = `Ada doesn't cover ${p.notCovered} yet.`
      else if (styleSuggestLabel) title = `Did you mean ${styleSuggestLabel}?`
      else if (n === 0) title = 'No matches — this time.'
      else if (n === 5) {
        if (isChat) title = '5 stays Ada matched to your message.'
        else if (isEmptyFilterSearch) title = '5 stays to start exploring.'
        else title = '5 stays from your filters.'
      }
      else if (n === 1) title = 'One stay fits — exactly.'
      else title = `${n} stays clear your bar.`

      // Scenario 1 — fewer than five matched. Reframe the short list as rigor.
      // Suppressed when a style typo is being surfaced, so there's only one note.
      let partialNote = ''
      if (n >= 1 && n < 5 && !p.styleSuggest) {
        const matches = n === 1 ? 'one real match' : `${n} real matches`
        partialNote = `Ada would rather show you ${matches} than fill the list with places you'd skip. Loosen a filter to widen the field.`
      }

      // Scenario 2 & 3 (+ typo) — nothing matched.
      let emptyMsg = ''
      if (n === 0) {
        if (p.suggest && p.suggestCovered) {
          // Likely typo of a covered city.
          emptyMsg = `Ada doesn't have a destination spelled quite like that. Did you mean ${p.suggest}?`
        } else if (p.suggest) {
          // Likely typo of a city Ada doesn't cover.
          emptyMsg = `Ada doesn't have a destination spelled quite like that — did you mean ${p.suggest}? It's not one of the 13 places Ada searches yet, but you can pick one below.`
        } else if (p.notCovered) {
          // Scenario 3 — recognised city Ada doesn't serve yet.
          emptyMsg = `${p.notCovered} isn't one of the 13 places Ada searches today. Pick one below, or try a different search.`
        } else if (
          p.checkin &&
          p.checkout &&
          pickStays({ ...p, checkin: undefined, checkout: undefined }).length > 0
        ) {
          // Dates are the binding constraint — everything else has matches.
          const place =
            p.area && p.where ? `${p.area}, ${p.where}` : p.where && p.where !== 'flexible' ? p.where : ''
          const range = formatDateRange(p.checkin, p.checkout)
          emptyMsg = place
            ? `Nothing in ${place} is free for ${range}. Try different dates, or loosen another filter.`
            : `Nothing's free for ${range} that fits the rest of your search. Try different dates or loosen a filter.`
        } else if (p.style && pickStays({ ...p, style: undefined }).length > 0) {
          // The chosen style has no stay in this scope — say so by name.
          const styleLabel = STYLE_LABELS[p.style]
          const place =
            p.area && p.where && p.where !== 'flexible'
              ? `${p.area}, ${p.where}`
              : p.where && p.where !== 'flexible'
                ? p.where
                : ''
          emptyMsg = place
            ? `Ada doesn't have any ${styleLabel} stays in ${place} yet. Try a different style, or drop it to see what's there.`
            : `Ada doesn't have any ${styleLabel} stays that fit the rest of your search. Try a different style or loosen a filter.`
        } else if (p.where && p.where !== 'flexible' && (p.minPrice != null || p.maxPrice != null || p.area)) {
          // Scenario 2 — covered city, budget/neighbourhood too tight (name the
          // real floor for that scope).
          const place = p.area ? `${p.area}, ${p.where}` : p.where
          const cheapest = cheapestInScope(p.where, p.area)
          if ((p.minPrice != null || p.maxPrice != null) && cheapest)
            emptyMsg = `Nothing in ${place} clears all your filters right now — the lowest Ada tracks there is ${formatPrice(priceInCurrency(cheapest, cur), cur)}/night. Nudge your budget or drop a filter and she'll find your five.`
          else
            emptyMsg = `Nothing in ${place} clears all your filters right now. Loosen a filter and Ada will fill the list.`
        } else if (p.minPrice != null && p.maxPrice != null) {
          emptyMsg = `Nothing matched ${sym}${dispUsd(p.minPrice)}–${sym}${dispUsd(p.maxPrice)}/night that fits everything else. Widen your range or drop a filter and she'll find your five.`
        } else if (p.maxPrice != null) {
          emptyMsg = `Nothing matched under ${sym}${dispUsd(p.maxPrice)}/night that fits everything else. Nudge your budget up or drop a filter and she'll find your five.`
        } else if (p.minPrice != null) {
          emptyMsg = `Nothing matched from ${sym}${dispUsd(p.minPrice)}/night up that fits everything else. Lower your minimum or drop a filter and she'll find your five.`
        } else {
          emptyMsg = 'Nothing matched every detail. Loosen one filter and Ada will fill the list.'
        }
      }

      // Carry the parsed filters (guests, budget, dates, style, advanced) so a
      // corrected destination — the typo CTA or a city chip — keeps them.
      const carry = new URLSearchParams()
      if (p.guests) carry.set('guests', String(p.guests))
      if (p.infants) carry.set('infants', String(p.infants))
      if (p.pets) carry.set('pets', String(p.pets))
      if (p.checkin) carry.set('checkin', p.checkin)
      if (p.checkout) carry.set('checkout', p.checkout)
      if (p.style) carry.set('style', p.style)
      if (p.minPrice != null) carry.set('priceMin', String(p.minPrice))
      if (p.maxPrice != null) carry.set('price', String(p.maxPrice))
      if (p.wifi && p.wifi !== 'any') carry.set('wifi', p.wifi)
      if (p.reviews && p.reviews !== 'any') carry.set('reviews', p.reviews)
      if (p.rating && p.rating !== 'any') carry.set('rating', p.rating)
      if (p.amenities?.length) carry.set('amenities', p.amenities.join(','))
      if (p.booking?.length) carry.set('booking', p.booking.join(','))
      if (p.access?.length) carry.set('access', p.access.join(','))
      if (p.tags?.length) carry.set('tags', p.tags.join(','))
      const carryQuery = carry.toString()

      return {
        stays: picked,
        via: p.via,
        mood: p.mood,
        guests: p.guests,
        styleSuggest: p.styleSuggest,
        eyebrow: isChat ? 'WHAT YOU TOLD ADA' : isEmptyFilterSearch ? 'STARTING PICKS' : 'YOUR FILTERED PICKS',
        title,
        carryQuery,
        // Covered typo → a one-click "Show {city} stays". Otherwise (uncovered
        // city or uncovered typo) → the grid of covered-city chips.
        suggestCity: p.suggest && p.suggestCovered ? p.suggest : '',
        showChips: !!p.notCovered || (!!p.suggest && !p.suggestCovered),
        contextText: ctx,
        isChatQuote: p.via === 'chat' && !!ctxRaw,
        emptyMsg,
        partialNote,
      }
    }, [search, cur])

  // A mood click shows image-led inspiration cards built from the curated photos —
  // each image's own <style>__<city> filename drives what's shown. Reshuffled every
  // visit (keyed on location.key so the same mood re-randomises on each click).
  const moodStayList = useMemo(() => {
    if (via !== 'mood' || !mood) return []
    return shuffle(moodStays(mood)).slice(0, 5)
  }, [via, mood, location.key])

  const isMood = via === 'mood'
  const isStyleSectionSearch = searchParams.get('from') === 'styles'
  const backHash = isMood ? '#moods' : isStyleSectionSearch ? '#styles' : ''
  const backToAdaHref = `/?${search}${backHash}`
  // Browse-card entries didn't "refine" anything — label the link by where they came from.
  const backLabel = isStyleSectionSearch
    ? 'Back to style options'
    : isMood
      ? 'Back to mood options'
      : 'Refine your search'
  const displayEyebrow = isMood
    ? 'A MOOD TO EXPLORE'
    : isStyleSectionSearch
      ? 'A STYLE TO EXPLORE'
      : eyebrow
  // Name the specific style/mood in the title and use its tone/meta as the
  // subheader, so eyebrow (category) → title (which one) → subheader (flavour)
  // each add something instead of repeating "style"/"mood".
  const styleInfo = STYLES.find((s) => s.id === searchParams.get('style'))
  const moodInfo = MOOD_INFO[mood ?? '']
  const displayTitle = isMood
    ? `5 ${(moodInfo?.word ?? '').toLowerCase()} stays.`
    : isStyleSectionSearch && stays.length > 0 && styleInfo
      ? `5 ${styleInfo.name} stays.`
      : title
  const displayContext = isMood
    ? moodInfo?.meta ?? contextText
    : isStyleSectionSearch && stays.length > 0 && styleInfo
      ? styleInfo.tone
      : contextText

  // "Did you mean Scandinavian?" — a likely style typo from the chat box.
  const suggestLabel = styleSuggest ? STYLE_LABELS[styleSuggest as keyof typeof STYLE_LABELS] : undefined
  const suggestWhere = searchParams.get('where')
  const suggestScopeText =
    suggestWhere && suggestWhere !== 'flexible' ? `all ${suggestWhere} stays` : 'everything that matched'
  const applyStyleSuggest = () => {
    if (!styleSuggest) return
    const next = new URLSearchParams(searchParams)
    next.set('style', styleSuggest)
    next.delete('styleSuggest')
    navigate('/results?' + next.toString())
  }

  useEffect(() => {
    document.title = 'Your stays · Ada'
    window.scrollTo(0, 0)
  }, [search])

  // Link to a city's results, preserving the parsed filters (guests, budget…).
  // Preserve where the search came from. A chat-origin search (e.g. correcting a
  // city typo via "Show Berlin stays") stays a chat search and keeps the typed
  // text, so going Back restores the chat box — not the search-box filters.
  const cityHref = (city: string) => {
    const origin = via === 'chat' ? 'chat' : 'filters'
    const q = via === 'chat' ? searchParams.get('q') : null
    const qPart = q ? `&q=${encodeURIComponent(q)}` : ''
    return `/results?via=${origin}&where=${encodeURIComponent(city)}${qPart}${carryQuery ? '&' + carryQuery : ''}`
  }

  return (
    <>
      <Header />

      <main>
        <section className="results-intro">
          <div className="container">
            <Link to={backToAdaHref} className="back-link" aria-label={backLabel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              {backLabel}
            </Link>
            <div className="results-eyebrow">{displayEyebrow}</div>
            <h1 className="results-title">{displayTitle}</h1>
            <p className={'results-context' + (isChatQuote ? ' is-chat-quote' : '')}>{displayContext}</p>
            {partialNote && <p className="results-partial-note">{partialNote}</p>}
          </div>
        </section>

        <section className="container">
          {suggestLabel && stays.length > 0 && (
            <div className="style-suggest">
              <span>
                That isn't a style Ada recognized — showing {suggestScopeText} for now.
              </span>
              <button type="button" className="style-suggest-btn" onClick={applyStyleSuggest}>
                Show {suggestLabel} stays
              </button>
            </div>
          )}
          {isMood ? (
            <div className="stays-list">
              {moodStayList.map(({ stay, imageSrc }, i) => (
                <StayCard key={stay.id} stay={stay} index={i} isLoggedIn={IS_LOGGED_IN} currency={cur} imageSrc={imageSrc} />
              ))}
            </div>
          ) : stays.length > 0 ? (
            <div className="stays-list">
              {stays.map((s, i) => (
                <StayCard key={s.id} stay={s} index={i} isLoggedIn={IS_LOGGED_IN} currency={cur} guestsOverride={guests} />
              ))}
            </div>
          ) : (
            <div className="results-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <p>{emptyMsg}</p>
              {suggestCity ? (
                <Link to={cityHref(suggestCity)} className="cta-primary">
                  Show {suggestCity} stays
                </Link>
              ) : showChips ? (
                <div className="results-empty-cities">
                  {CITIES.map((c) => (
                    <Link key={c.name} to={cityHref(c.name)} className="results-empty-chip">
                      {c.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link to={`/?${search}`} className="cta-primary">
                  Adjust your search
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="results-outro">
          <div className="container">
            <h2>Not the right fit?</h2>
            <Link to={backToAdaHref} className="cta-primary">
              Start a new search
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
