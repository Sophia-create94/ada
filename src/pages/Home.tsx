import { Fragment, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SearchCard from '../components/search/SearchCard'
import ChatCard from '../components/ChatCard'
import Moods from '../components/Moods'
import HorizontalScrollbar from '../components/HorizontalScrollbar'
import HowItWorks from '../components/HowItWorks'
import WhyAda from '../components/WhyAda'
import { STYLES } from '../data/styles'

const STYLE_DESCRIPTIONS = {
  modern:
    'For stays that feel current, open, and edited. Think clean lines, practical furniture, neutral tones, and rooms where every detail has a purpose.',
  scandinavian:
    'Bright, practical, and quietly cozy. Expect pale wood, soft neutrals, natural light, and furniture that feels easy to live with.',
  traditional:
    'Classic rooms with a sense of history. Look for layered textiles, framed art, moldings, vintage pieces, and details that feel collected over time.',
  industrial:
    'Loft energy with a raw edge. Exposed brick, steel, concrete, big windows, and open rooms give these stays an urban, lived-in character.',
  japandi:
    'A calm blend of Japanese restraint and Scandinavian warmth. Natural wood, low profiles, handmade textures, and breathing room keep it simple but soft.',
  minimalist:
    'For travelers who want visual quiet. Fewer objects, clear surfaces, neutral tones, and purposeful furniture make the stay feel calm and open.',
} satisfies Record<(typeof STYLES)[number]['id'], string>

export default function Home() {
  const styleRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = styleRowRef.current
    if (!row) return
    row.scrollLeft = 0
    row.dataset.scrollPos = 'start'
    const update = () => {
      const overflows = row.scrollWidth > row.clientWidth + 2
      if (!overflows) {
        row.dataset.scrollPos = 'start'
        return
      }
      const atEnd = row.scrollLeft >= row.scrollWidth - row.clientWidth - 4
      const atStart = row.scrollLeft <= 6
      row.dataset.scrollPos = atEnd ? 'end' : atStart ? 'start' : 'middle'
    }
    row.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      row.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <h1 className="hero-headline">Stays that match your taste.</h1>
          <p className="hero-subhead">
            Ada’s AI-powered search finds five stays you’d actually book — not 100 to sift through.
            Start searching today with no account, or sign up for free to get personalized results.
          </p>

          <SearchCard />

          <div className="or-badge" aria-hidden="true">
            or
          </div>

          <ChatCard />

          <div className="trust-strip">
            <strong>Ada searches</strong>{' '}
            {[
              { name: 'Airbnb', url: 'https://www.airbnb.com' },
              { name: 'Booking.com', url: 'https://www.booking.com' },
              { name: 'Vrbo', url: 'https://www.vrbo.com' },
              { name: 'Plum Guide', url: 'https://www.plumguide.com' },
              { name: 'Tablet Hotels', url: 'https://www.tablethotels.com' },
            ].map((p, i) => (
              <Fragment key={p.name}>
                {i > 0 && <span className="trust-strip-sep"> · </span>}
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {p.name}
                </a>
              </Fragment>
            ))}
          </div>
        </section>

        {/* BROWSE — by style or mood */}
        <section className="browse">
          <div className="browse-inner">
            <div className="browse-head">
              <div className="eyebrow">NOT SURE WHERE TO START?</div>
              <h2 className="section-title">Browse by style or mood.</h2>
              <p className="moods-subhead">
                Pick a look you love or a mood you're after, and Ada finds five matching stays.
              </p>
            </div>

            <div className="browse-block" id="styles">
              <h3 className="browse-block-title">By style</h3>
              <div className="style-showcase-row" ref={styleRowRef} data-scroll-pos="start">
              {STYLES.map((s) => (
                <Link
                  className="style-showcase-card"
                  key={s.id}
                  to={`/results?via=filters&style=${s.id}&from=styles`}
                  aria-label={`Show ${s.name} stays`}
                >
                  <img
                    className="style-showcase-img"
                    src={`/assets/style/${s.asset}.jpg`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="style-showcase-copy">
                    <h3>{s.name}</h3>
                    <p className="style-showcase-tone">{s.tone}</p>
                    <p>{STYLE_DESCRIPTIONS[s.id]}</p>
                    <span className="style-showcase-cta">
                      Search this style
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
              </div>
              <HorizontalScrollbar targetRef={styleRowRef} />
            </div>

            <Moods />
          </div>
        </section>

        {/* WHAT MAKES ADA DIFFERENT (tabs) */}
        <WhyAda />

        {/* HOW */}
        <HowItWorks />

      </main>

      {/* CTA */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2 className="cta-band-title">Stop spending hours on booking sites.</h2>
          <p className="cta-band-body">
            Ada finds five stays you'd actually book. Free to start, better every trip.
          </p>
          <span className="cta-band-btn cta-static">
            Create a free account
          </span>
        </div>
      </section>

      <Footer />
    </>
  )
}
