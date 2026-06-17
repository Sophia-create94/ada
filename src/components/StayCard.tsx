import type { Stay } from '../data/types'
import { STYLE_LABELS } from '../data/styles'
import { getImageUrl } from '../data/images'

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

type Props = {
  stay: Stay
  index: number
  // New visitors see "Ada's pick #N"; logged-in users get a % match (future state).
  isLoggedIn?: boolean
}

export default function StayCard({ stay, index, isLoggedIn = false }: Props) {
  const matchLabel = isLoggedIn ? `${96 - index * 2}% match` : `Ada's pick #${index + 1}`

  return (
    <article className="stay-card">
      <div className="stay-image-wrap">
        <img src={getImageUrl(stay)} alt={stay.name} data-asset-slug={stay.image} loading="lazy" />
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
          <span>{stay.loc}</span>
          <span className="stay-meta-sep">·</span>
          <span className="stay-style-tag">{STYLE_LABELS[stay.style]}</span>
        </div>
        <div className="stay-specs">{stay.specs}</div>
        <div className="stay-why">
          <span className="stay-why-label">Why Ada picked this</span>
          <div className="stay-why-text">{stay.why}</div>
        </div>
        <div className="stay-bottom-row">
          <div className="stay-price-block">
            <span className="stay-price">{stay.priceDisplay}</span>
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
