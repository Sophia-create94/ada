import { useRef, useState } from 'react'

const STEPS = [
  {
    n: '01',
    title: 'Start any way you like',
    short: 'Start',
    body: 'Set the advanced filters, describe the trip in plain English in the chat, pick a style you love, or tap a mood card to get inspired. No account needed to search.',
  },
  {
    n: '02',
    title: 'Ada scans every platform at once',
    short: 'How Ada searches',
    body: 'Airbnb, Booking, Vrbo, Plum Guide and a dozen others. Ada weights them against your search and surfaces the five most likely to land — same price as the source, no markup, no added fees.',
  },
  {
    n: '03',
    title: 'Sign up to make it personal',
    short: 'Make it personal',
    body: 'Create a free account and Ada starts learning — the styles you love, the amenities you filter for, the stays you save and book. Every trip, the results get more personal.',
  },
]

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'left' ? (
      <>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </>
    ) : (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    )}
  </svg>
)

// Desktop shows all three steps in the grid. On phones, only the active step
// shows (CSS), advanced via the Back / Next buttons below — fewer swipe rows.
export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const last = STEPS.length - 1
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  // Swipe-to-advance on the step card (complements the arrows/dots). Only acts
  // on a clear horizontal flick so vertical page scrolling isn't hijacked.
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current
    touchStart.current = null
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return
    if (dx < 0) setActive((a) => Math.min(last, a + 1))
    else setActive((a) => Math.max(0, a - 1))
  }

  return (
    <section className="how" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">HOW ADA WORKS</div>
          <h2 className="section-title">Simple to start. Smarter every time.</h2>
        </div>

        <div className="how-grid" data-active={active} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {STEPS.map((s) => (
            <div className="how-step" key={s.n}>
              <div className="how-number">{s.n}</div>
              <div className="how-step-title">{s.title}</div>
              <div className="how-step-body">{s.body}</div>
            </div>
          ))}
        </div>

        {/* Mobile-only stepper controls (hidden on desktop, where all 3 show):
            compact prev/next arrows flanking progress dots. */}
        <div className="how-nav">
          <button
            className="how-nav-arrow"
            type="button"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            aria-label="Previous step"
          >
            <Arrow dir="left" />
          </button>
          <div className="how-dots" role="tablist" aria-label="Steps">
            {STEPS.map((s, i) => (
              <button
                key={s.n}
                type="button"
                className={'how-dot' + (i === active ? ' is-active' : '')}
                onClick={() => setActive(i)}
                aria-label={`Step ${i + 1} of ${STEPS.length}`}
                aria-current={i === active}
              />
            ))}
          </div>
          <button
            className="how-nav-arrow"
            type="button"
            onClick={() => setActive((a) => Math.min(last, a + 1))}
            disabled={active === last}
            aria-label="Next step"
          >
            <Arrow dir="right" />
          </button>
        </div>
      </div>
    </section>
  )
}
