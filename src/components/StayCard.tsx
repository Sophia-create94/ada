import type { Stay, Currency } from '../data/types'
import { STYLE_LABELS } from '../data/styles'
import { cityCountry } from '../data/cities'
import { getImageUrl, PLACEHOLDER_IMG } from '../data/images'
import { formatPrice, priceInCurrency } from '../data/currency'

const StarIcon = () => (
  <svg className="star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 6.91-1.01L12 2z" />
  </svg>
)
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3l1.8 5.4L19.2 11l-5.4 1.8L12 19l-1.8-6.2L4.8 11l5.4-2.6L12 3z" />
  </svg>
)
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

type Props = {
  stay: Stay
  index: number
  // New visitors see "Ada's pick #N"; logged-in users get a % match (future state).
  isLoggedIn?: boolean
  currency?: Currency
  // When set (mood results), overrides the stay photo with a curated mood image.
  imageSrc?: string
  // When set (a guest search), the card shows this party size — stays flex to it.
  guestsOverride?: number
}

export default function StayCard({ stay, index, isLoggedIn = false, currency = 'USD', imageSrc, guestsOverride }: Props) {
  const matchLabel = isLoggedIn ? `${96 - index * 2}% match` : `Ada's pick #${index + 1}`
  const price = formatPrice(priceInCurrency(stay, currency), currency)
  const specs = guestsOverride
    ? stay.specs.replace(/\d+\s+guests?/, `${guestsOverride} ${guestsOverride === 1 ? 'guest' : 'guests'}`)
    : stay.specs
  const wifiTier = stay.wifiSpeed >= 250 ? 'Fiber' : stay.wifiSpeed >= 100 ? 'Fast' : ''
  const wifiFast = stay.wifiSpeed >= 100

  return (
    <article className="stay-card">
      <div className="stay-image-wrap">
        <img
          src={imageSrc ?? getImageUrl(stay)}
          alt={stay.name}
          data-asset-slug={stay.image}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget
            if (img.dataset.fallback) return
            img.dataset.fallback = '1'
            img.src = PLACEHOLDER_IMG
          }}
        />
        <div className="stay-match-badge">
          <SparkleIcon />
          <span>{matchLabel}</span>
        </div>
        <div className="stay-source-badge">{stay.source}</div>
      </div>
      <div className="stay-content">
        <div className="stay-header-row">
          <div className="stay-name">{stay.name}</div>
          <div className="stay-rating">
            <StarIcon />
            <span>
              {stay.rating} <span style={{ color: 'var(--text-tertiary)' }}>({stay.reviews})</span>
            </span>
          </div>
        </div>
        <div className="stay-meta">
          <span>{cityCountry(stay.city)}</span>
          <span className="stay-meta-sep">·</span>
          <span className="stay-style-tag">{STYLE_LABELS[stay.style]}</span>
        </div>
        <div className="stay-specs">{specs}</div>
        <div className="stay-pills">
          <span className={'stay-pill' + (wifiFast ? ' is-fast' : '')}>
            <WifiIcon />
            {`${wifiTier} Wi-Fi · ${stay.wifiSpeed} Mbps`.trim()}
          </span>
        </div>
        <div className="stay-why">
          <span className="stay-why-label">Why Ada picked this</span>
          <div className="stay-why-text">{stay.why}</div>
        </div>
        <div className="stay-bottom-row">
          <div className="stay-price-block">
            <span className="stay-price">{price}</span>
            <span className="stay-price-unit">/ night</span>
          </div>
          <a className="stay-view-link" href={stay.sourceUrl} target="_blank" rel="noopener noreferrer">
            View on {stay.source} <ArrowIcon />
          </a>
        </div>
      </div>
    </article>
  )
}
