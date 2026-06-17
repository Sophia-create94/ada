import { useEffect, useRef, useState } from 'react'
import type { Advanced, AmenityId, BookingTag } from './types'

const CheckIcon = () => (
  <span className="adv-chip-check">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
)

type SegKey = 'wifiSpeed' | 'minReviews' | 'minRating'

const SEGMENTS: { key: SegKey; label: string; icon: React.ReactNode; options: { value: string; label: string }[] }[] = [
  {
    key: 'wifiSpeed',
    label: 'Wi-Fi speed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
    options: [
      { value: 'any', label: 'Any' },
      { value: '25', label: '25+ Mbps' },
      { value: '100', label: '100+ Mbps' },
      { value: '250', label: 'Fiber 250+' },
    ],
  },
  {
    key: 'minReviews',
    label: 'Minimum reviews',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    options: [
      { value: 'any', label: 'Any' },
      { value: '10', label: '10+' },
      { value: '50', label: '50+' },
      { value: '100', label: '100+' },
      { value: '500', label: '500+' },
    ],
  },
  {
    key: 'minRating',
    label: 'Minimum rating',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 22 L12 18.56 L5.82 22 L7 14.14 L2 9.27 L8.91 8.26 Z" />
      </svg>
    ),
    options: [
      { value: 'any', label: 'Any' },
      { value: '4.0', label: '★ 4.0+' },
      { value: '4.5', label: '★ 4.5+' },
      { value: '4.8', label: '★ 4.8+' },
    ],
  },
]

const AMENITIES: { value: AmenityId; label: string }[] = [
  { value: 'washer', label: 'Washer / dryer' },
  { value: 'kitchen', label: 'Full kitchen' },
  { value: 'pool', label: 'Pool' },
  { value: 'parking', label: 'Free parking' },
  { value: 'ac', label: 'Air conditioning' },
  { value: 'workspace', label: 'Dedicated workspace' },
  { value: 'hottub', label: 'Hot tub' },
  { value: 'ev', label: 'EV charger' },
]

const BOOKINGS: { value: BookingTag; label: string }[] = [
  { value: 'cancellation', label: 'Free cancellation' },
  { value: 'instant', label: 'Instant book' },
  { value: 'superhost', label: 'Top-rated host' },
]

// Segmented control that tracks its own overflow so the edge-fade mask
// (driven by data-scrollable / data-scroll-pos) appears when pills overflow.
function Segment({
  segKey,
  options,
  value,
  onChange,
  expanded,
}: {
  segKey: SegKey
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  expanded: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  const measure = () => {
    const el = ref.current
    if (!el) return
    const scrollable = el.scrollWidth > el.clientWidth + 2
    el.dataset.scrollable = scrollable ? 'true' : 'false'
    if (scrollable) {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2
      el.dataset.scrollPos = atEnd ? 'end' : el.scrollLeft <= 2 ? 'start' : 'middle'
    } else {
      delete el.dataset.scrollPos
    }
  }

  useEffect(() => {
    // Re-measure after the expand transition and on resize.
    const t = setTimeout(measure, expanded ? 320 : 0)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  return (
    <div className="adv-segment" data-adv-segment={segKey} ref={ref} onScroll={measure}>
      {options.map((o) => (
        <button
          key={o.value}
          className={'adv-segment-btn' + (value === o.value ? ' is-active' : '')}
          type="button"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

type Props = {
  advanced: Advanced
  onSetSegment: (key: SegKey, value: string) => void
  onToggleAmenity: (value: AmenityId) => void
  onToggleBooking: (value: BookingTag) => void
  onClear: () => void
}

export default function AdvancedFilters({
  advanced,
  onSetSegment,
  onToggleAmenity,
  onToggleBooking,
  onClear,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const count =
    (advanced.wifiSpeed !== 'any' ? 1 : 0) +
    (advanced.minReviews !== 'any' ? 1 : 0) +
    (advanced.minRating !== 'any' ? 1 : 0) +
    advanced.amenities.length +
    advanced.booking.length

  return (
    <div className={'advanced-filters' + (expanded ? ' is-expanded' : '')}>
      <button
        className="adv-header"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="adv-header-left">
          <span className="adv-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </span>
          <span>Advanced filters</span>
        </span>
        <span className="adv-header-right">
          <span className={'adv-applied-count' + (count > 0 ? ' is-set' : '')}>
            {count > 0 ? `${count} applied` : ''}
          </span>
          <svg className="adv-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div className="adv-body">
        <div className="adv-body-inner">
          {SEGMENTS.map((seg) => (
            <div className="adv-group" key={seg.key}>
              <div className="adv-group-label">
                {seg.icon}
                {seg.label}
              </div>
              <Segment
                segKey={seg.key}
                options={seg.options}
                value={advanced[seg.key]}
                onChange={(v) => onSetSegment(seg.key, v)}
                expanded={expanded}
              />
            </div>
          ))}

          <div className="adv-group">
            <div className="adv-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Amenities
            </div>
            <div className="adv-chips">
              {AMENITIES.map((a) => (
                <button
                  key={a.value}
                  className={'adv-chip' + (advanced.amenities.includes(a.value) ? ' is-active' : '')}
                  type="button"
                  onClick={() => onToggleAmenity(a.value)}
                >
                  <CheckIcon />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="adv-group">
            <div className="adv-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Booking
            </div>
            <div className="adv-chips">
              {BOOKINGS.map((b) => (
                <button
                  key={b.value}
                  className={'adv-chip' + (advanced.booking.includes(b.value) ? ' is-active' : '')}
                  type="button"
                  onClick={() => onToggleBooking(b.value)}
                >
                  <CheckIcon />
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="adv-footer">
            <button className="adv-clear" type="button" disabled={count === 0} onClick={onClear}>
              Clear all advanced filters
            </button>
            <span className="adv-hint">More filters coming — tell Ada what you'd want</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { SegKey }
