import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import StayCard from '../components/StayCard'
import { parseResultsParams, pickStays, buildContextLine, cheapestInScope, formatDateRange } from '../data/stays'
import { CITIES } from '../data/cities'

// Portfolio build: default everyone to the new-visitor state. Flip this to true
// to preview the logged-in experience (no nudge block, % match badges).
const IS_LOGGED_IN = false

export default function Results() {
  const [searchParams] = useSearchParams()
  const search = searchParams.toString()
  const [dismissedNudge, setDismissedNudge] = useState(false)

  // Parse + pick once per URL so "I'm flexible" doesn't reshuffle on re-render.
  const { stays, eyebrow, title, contextText, isChatQuote, emptyMsg, partialNote, showChips, suggestCity, carryQuery } =
    useMemo(() => {
      const p = parseResultsParams(new URLSearchParams(search))
      const picked = pickStays(p)
      const n = picked.length
      const isChat = p.via === 'chat' || p.via === 'mood'
      const ctxRaw = buildContextLine(p)
      let ctx = ctxRaw
      if (isChat) {
        const trimmed = ctxRaw.length > 200 ? ctxRaw.slice(0, 200) + '…' : ctxRaw
        ctx = trimmed ? `"${trimmed}"` : ''
      } else if (!ctx) {
        ctx = "Ada's top picks, sorted by match strength."
      }

      // Count-aware title. Five = the full promise; 1–4 = "fewer is the feature";
      // 0 = an honest empty state (typo / uncovered city / constraints too tight).
      let title: string
      if (n === 0) {
        if (p.suggest) title = `Did you mean ${p.suggest}?`
        else if (p.notCovered) title = `Ada doesn't cover ${p.notCovered} yet.`
        else title = 'No matches — this time.'
      } else if (n === 5) {
        title = isChat ? '5 stays Ada matched to your message.' : '5 stays from your filters.'
      } else if (n === 1) {
        title = 'One stay fits — exactly.'
      } else {
        title = `${n} stays clear your bar.`
      }

      // Scenario 1 — fewer than five matched. Reframe the short list as rigor.
      let partialNote = ''
      if (n >= 1 && n < 5) {
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
        } else if (p.where && p.where !== 'flexible' && (p.maxPrice || p.area)) {
          // Scenario 2 — covered city, budget/neighbourhood too tight (name the
          // real floor for that scope).
          const place = p.area ? `${p.area}, ${p.where}` : p.where
          const cheapest = cheapestInScope(p.where, p.area)
          if (p.maxPrice && cheapest)
            emptyMsg = `Nothing in ${place} clears all your filters right now — the lowest Ada tracks there is ${cheapest.priceDisplay}/night. Nudge your budget up or drop a filter and she'll find your five.`
          else
            emptyMsg = `Nothing in ${place} clears all your filters right now. Loosen a filter and Ada will fill the list.`
        } else if (p.maxPrice) {
          emptyMsg = `Nothing matched under $${p.maxPrice}/night that fits everything else. Nudge your budget up or drop a filter and she'll find your five.`
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
      if (p.maxPrice) carry.set('price', String(p.maxPrice))
      if (p.wifi && p.wifi !== 'any') carry.set('wifi', p.wifi)
      if (p.reviews && p.reviews !== 'any') carry.set('reviews', p.reviews)
      if (p.rating && p.rating !== 'any') carry.set('rating', p.rating)
      if (p.amenities?.length) carry.set('amenities', p.amenities.join(','))
      if (p.booking?.length) carry.set('booking', p.booking.join(','))
      const carryQuery = carry.toString()

      return {
        stays: picked,
        eyebrow: isChat ? 'WHAT YOU TOLD ADA' : 'YOUR FILTERED PICKS',
        title,
        carryQuery,
        // Covered typo → a one-click "Show {city} stays". Otherwise (uncovered
        // city or uncovered typo) → the grid of covered-city chips.
        suggestCity: p.suggest && p.suggestCovered ? p.suggest : '',
        showChips: !!p.notCovered || (!!p.suggest && !p.suggestCovered),
        contextText: ctx,
        isChatQuote: isChat && !!ctxRaw,
        emptyMsg,
        partialNote,
      }
    }, [search])

  useEffect(() => {
    document.title = 'Your stays · Ada'
    window.scrollTo(0, 0)
  }, [search])

  const showNudge = !IS_LOGGED_IN && !dismissedNudge && stays.length > 0

  // Link to a city's results, preserving the parsed filters (guests, budget…).
  const cityHref = (city: string) =>
    `/results?via=filters&where=${encodeURIComponent(city)}${carryQuery ? '&' + carryQuery : ''}`

  return (
    <>
      <Header />

      <main>
        <section className="results-intro">
          <div className="container">
            <Link to="/" className="back-link" aria-label="Refine your search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Refine your search
            </Link>
            <div className="results-eyebrow">{eyebrow}</div>
            <h1 className="results-title">{title}</h1>
            <p className={'results-context' + (isChatQuote ? ' is-chat-quote' : '')}>{contextText}</p>
            {partialNote && <p className="results-partial-note">{partialNote}</p>}
          </div>
        </section>

        <section className="container">
          {stays.length > 0 ? (
            <div className="stays-list">
              {stays.map((s, i) => (
                <StayCard key={s.id} stay={s} index={i} isLoggedIn={IS_LOGGED_IN} />
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
                <Link to="/" className="cta-primary">
                  Adjust your search
                </Link>
              )}
            </div>
          )}

          {showNudge && (
            <div className="nudge-block">
              <div className="nudge-eyebrow">These are just the beginning</div>
              <div className="nudge-title">Ada gets better every time you use it</div>
              <p className="nudge-body">
                Right now these results are matched to your filters. Create a free account and Ada
                starts learning from what you save, skip, and book. By your fifth search, Ada already
                knows what you'd skip.
              </p>
              <div className="nudge-actions">
                <button className="nudge-cta-primary" type="button">
                  Create a free account
                </button>
                <button
                  className="nudge-cta-secondary"
                  type="button"
                  onClick={() => setDismissedNudge(true)}
                >
                  Continue without account
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="results-outro">
          <div className="container">
            <h2>Not the right fit?</h2>
            <p>
              Adjust your filters, try a different prompt, or start with a feeling — Sun-soaked,
              Storied, Dreamy.
            </p>
            <Link to="/" className="cta-primary">
              Back to Ada
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
