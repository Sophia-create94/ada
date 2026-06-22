const ACCOUNT_PREVIEW_STAYS = [
  {
    name: 'Sky Studio',
    meta: 'Tokyo · Minimalist',
    match: '96% match',
    image: '/assets/style/minimalist/ada-tk-shibuya-skyloft.jpg',
    reason: 'Ada noticed you save bright, quiet high-rise stays with fast Wi-Fi.',
    liked: true,
    saved: true,
  },
  {
    name: "Painter's Atelier",
    meta: 'Paris · Japandi',
    match: '92% match',
    image: '/assets/style/japandi/ada-pa-marais-atelier.jpg',
    reason: 'Soft wood and calm streets, like the place you booked last trip.',
    liked: true,
    saved: false,
  },
  {
    name: 'Mirror Suite',
    meta: 'Tokyo · Modern',
    match: '87% match',
    image: '/assets/style/modern/ada-tk-ginza-suite.jpg',
    reason: 'Still polished and central, but Ada ranks it lower after your skips.',
    liked: false,
    saved: false,
  },
]

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
)
const SkipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
// Save = bookmark (distinct from the like heart on the photo).
const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const PROPS = [
  {
    icon: '✦',
    title: 'Learns your taste',
    line: 'Save, like, skip, and book a few stays, and Ada builds your taste profile.',
  },
  {
    icon: '◐',
    title: 'Knows why it fits',
    line: 'Every pick shows a match score and why Ada chose it for you.',
  },
  {
    icon: '◊',
    title: 'Sharper every trip',
    line: 'The more you search, the more accurate your matches get.',
  },
]

const ProductShot = () => (
  <div className="product-shot" aria-label="Preview of Ada logged-in results">
    <div className="product-shot-body">
      <div className="product-shot-results">
        <div className="product-shot-heading">
          <span>PERSONALIZED PICKS</span>
        </div>
        <div className="product-shot-list">
          {ACCOUNT_PREVIEW_STAYS.map((stay) => (
            <article className="product-stay-card" key={stay.name}>
              <div className="product-stay-img">
                <img src={stay.image} alt="" loading="lazy" decoding="async" />
                <span className="product-match-badge">{stay.match}</span>
                <span
                  className={'product-heart' + (stay.liked ? ' is-saved' : '')}
                  aria-label={stay.liked ? 'Liked' : 'Like'}
                >
                  <HeartIcon filled={stay.liked} />
                </span>
              </div>
              <div className="product-stay-copy">
                <div>
                  <h3>{stay.name}</h3>
                  <p>{stay.meta}</p>
                </div>
                <p className="product-stay-reason">{stay.reason}</p>
                <div className="product-stay-actions">
                  <span className={stay.saved ? 'is-saved' : ''}>
                    <BookmarkIcon filled={stay.saved} />
                    {stay.saved ? 'Saved' : 'Save'}
                  </span>
                  <span>
                    <SkipIcon />
                    Skip
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <aside className="product-learning-panel">
        <div className="learning-panel-label">ADA LEARNED</div>
        <h3>Your taste profile is getting clearer.</h3>
        <div className="learning-group">
          <span className="learning-group-title">Likes</span>
          <div className="learning-chips">
            <span>Japandi</span>
            <span>Quiet streets</span>
            <span>Fast Wi-Fi</span>
          </div>
        </div>
        <div className="learning-group">
          <span className="learning-group-title">Skips</span>
          <div className="learning-chips">
            <span>Dark rooms</span>
            <span>Party blocks</span>
          </div>
        </div>
        <div className="learning-progress">
          <div>
            <span>Match confidence</span>
            <strong>87%</strong>
          </div>
          <div className="learning-progress-track">
            <span />
          </div>
        </div>
      </aside>
    </div>
  </div>
)

// "What makes Ada different" — scannable two-column: the 3 value props (one
// line each) beside the logged-in product screenshot. No clicks, nothing hidden.
export default function WhyAda() {
  return (
    <section className="features-section why-ada">
      <div className="features-head">
        <div className="eyebrow">AFTER SIGN UP</div>
        <h2 className="section-title">Personalized picks, every search.</h2>
      </div>

      <div className="why-split">
        <ul className="why-list">
          {PROPS.map((p) => (
            <li className="why-item" key={p.title}>
              <span className="why-item-icon" aria-hidden="true">{p.icon}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.line}</p>
              </div>
            </li>
          ))}
        </ul>
        <ProductShot />
      </div>
    </section>
  )
}
