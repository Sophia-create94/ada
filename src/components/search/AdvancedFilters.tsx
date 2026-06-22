import { useEffect, useMemo, useRef, useState } from 'react'
import type { Advanced, AmenityId, BookingTag, AccessId } from './types'
import { STAYS } from '../../data/stays.data'
import { CURRENCY_SYMBOL, priceInCurrency, convert } from '../../data/currency'
import { useCurrency } from '../../contexts/CurrencyContext'

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
  { value: 'washer', label: 'Washer' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'kitchen', label: 'Full kitchen' },
  { value: 'stove', label: 'Stove' },
  { value: 'pool', label: 'Pool' },
  { value: 'parking', label: 'Free parking' },
  { value: 'ac', label: 'Air conditioning' },
  { value: 'heating', label: 'Heating' },
  { value: 'workspace', label: 'Dedicated workspace' },
  { value: 'tv', label: 'TV' },
  { value: 'hairdryer', label: 'Hair dryer' },
  { value: 'iron', label: 'Iron' },
  { value: 'gym', label: 'Gym' },
  { value: 'balcony', label: 'Balcony' },
]

const BOOKINGS: { value: BookingTag; label: string }[] = [
  { value: 'cancellation', label: 'Free cancellation' },
  { value: 'instant', label: 'Instant book' },
  { value: 'selfcheckin', label: 'Self check-in' },
  { value: 'superhost', label: 'Top-rated host' },
  { value: 'petsallowed', label: 'Allows pets' },
]

const ACCESS: { value: AccessId; label: string }[] = [
  { value: 'stepfree', label: 'Step-free access' },
  { value: 'wideentrance', label: 'Wide entrance (32"+)' },
  { value: 'stepfreeshower', label: 'Step-free shower' },
  { value: 'grabbars', label: 'Bathroom grab bars' },
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
  histogramCity: string | null
  expanded: boolean
  onToggleExpanded: () => void
  onSetPrice: (key: 'minPrice' | 'maxPrice', value: number | null) => void
  onSetSegment: (key: SegKey, value: string) => void
  onToggleAmenity: (value: AmenityId) => void
  onToggleBooking: (value: BookingTag) => void
  onToggleAccess: (value: AccessId) => void
  onClear: () => void
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// Price domain + a smoothed histogram of the whole catalogue, in the chosen
// currency. Recomputed only when the currency changes.
// Fixed slider bounds (Airbnb-style), in canonical USD: $30 floor, $700+ cap
// (the catalogue tops out at $620, so a higher ceiling looks empty). Currency
// is purely a display concern, so the slider math stays in USD.
const DOMAIN_MIN = 30
const DOMAIN_MAX = 700

function usePriceStats(city: string | null) {
  return useMemo(() => {
    // Scope the histogram to the selected city (or the whole catalogue), so a
    // bar always corresponds to a real, filterable stay — no phantom bars.
    const pool = city ? STAYS.filter((s) => s.city === city) : STAYS
    const prices = pool.map((s) => priceInCurrency(s, 'USD'))
    const domainMin = DOMAIN_MIN
    const domainMax = DOMAIN_MAX
    const N = 28
    // Raw counts only — a bin with no stays renders no bar.
    const bins = new Array(N).fill(0)
    for (const p of prices) {
      const i = clamp(Math.floor(((p - domainMin) / (domainMax - domainMin)) * N), 0, N - 1)
      bins[i]++
    }
    const peak = Math.max(...bins, 1)
    return { domainMin, domainMax, bins, peak }
  }, [city])
}

const STEP = 10

function PriceRange({
  minPrice,
  maxPrice,
  city,
  onSetPrice,
}: {
  minPrice: number | null
  maxPrice: number | null
  city: string | null
  onSetPrice: (key: 'minPrice' | 'maxPrice', value: number | null) => void
}) {
  const { domainMin, domainMax, bins, peak } = usePriceStats(city)
  // Bounds + slider math are canonical USD; the global currency only changes
  // how the numbers are shown.
  const { currency } = useCurrency()
  const symbol = CURRENCY_SYMBOL[currency]
  const toDisp = (usd: number) => Math.round(convert(usd, 'USD', currency))
  const fromDisp = (disp: number) => Math.round(convert(disp, currency, 'USD'))
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)

  const minVal = minPrice ?? domainMin
  const maxVal = maxPrice ?? domainMax
  const span = domainMax - domainMin || 1
  const pct = (v: number) => ((clamp(v, domainMin, domainMax) - domainMin) / span) * 100

  function valueFromClientX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return domainMin
    const t = clamp((clientX - rect.left) / rect.width, 0, 1)
    return Math.round((domainMin + t * span) / STEP) * STEP
  }
  function apply(which: 'min' | 'max', v: number) {
    if (which === 'min') {
      const c = Math.min(v, maxVal - STEP)
      onSetPrice('minPrice', c <= domainMin ? null : c)
    } else {
      const c = Math.max(v, minVal + STEP)
      onSetPrice('maxPrice', c >= domainMax ? null : c)
    }
  }
  const onHandleDown = (which: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = which
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onHandleMove = (which: 'min' | 'max') => (e: React.PointerEvent) => {
    if (dragging.current !== which) return
    apply(which, valueFromClientX(e.clientX))
  }
  const onHandleUp = (e: React.PointerEvent) => {
    dragging.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }
  const onHandleKey = (which: 'min' | 'max') => (e: React.KeyboardEvent) => {
    const cur = which === 'min' ? minVal : maxVal
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      apply(which, cur - STEP)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      apply(which, cur + STEP)
    }
  }

  // Boxes show the live bound values ("$30", "$700+"); a bound at the domain
  // edge means "no floor / no cap". While a box is focused we show the user's
  // raw keystrokes (a "draft") instead of re-deriving from state, so the
  // controlled value never fights typing. Bounds are USD; boxes are in the
  // display currency.
  const [draft, setDraft] = useState<{ field: 'min' | 'max'; value: string } | null>(null)
  const setFromInput = (which: 'min' | 'max', digits: string) => {
    const usd = digits === '' ? null : fromDisp(parseInt(digits, 10))
    if (which === 'min') onSetPrice('minPrice', usd == null || usd <= domainMin ? null : Math.min(usd, domainMax))
    else onSetPrice('maxPrice', usd == null || usd >= domainMax ? null : usd)
  }
  const beginEdit = (field: 'min' | 'max', e: React.FocusEvent<HTMLInputElement>) => {
    setDraft({ field, value: String(toDisp(field === 'min' ? minVal : maxVal)) })
    e.target.select()
  }
  const editChange = (field: 'min' | 'max', raw: string) => {
    const digits = raw.replace(/[^\d]/g, '')
    setDraft({ field, value: digits })
    setFromInput(field, digits)
  }
  const minDisplay = draft?.field === 'min' ? draft.value : toDisp(minVal).toLocaleString('en-US')
  const maxDisplay =
    draft?.field === 'max'
      ? draft.value
      : toDisp(maxVal).toLocaleString('en-US') + (maxPrice == null ? '+' : '')

  return (
    <div className="adv-price">
      <div className="adv-histogram" aria-hidden="true">
        {bins.map((b, i) => {
          const center = domainMin + ((i + 0.5) / bins.length) * span
          const inRange = center >= minVal && center <= maxVal
          return (
            <span
              key={i}
              className={'adv-hist-bar' + (inRange ? ' is-in' : '')}
              style={{ height: `${(b / peak) * 100}%` }}
            />
          )
        })}
      </div>

      <div className="adv-slider" ref={trackRef}>
        <span className="adv-slider-rail" />
        <span className="adv-slider-fill" style={{ left: `${pct(minVal)}%`, right: `${100 - pct(maxVal)}%` }} />
        <button
          type="button"
          className="adv-slider-handle"
          style={{ left: `${pct(minVal)}%` }}
          role="slider"
          aria-label="Minimum price"
          aria-valuemin={domainMin}
          aria-valuemax={domainMax}
          aria-valuenow={minVal}
          onPointerDown={onHandleDown('min')}
          onPointerMove={onHandleMove('min')}
          onPointerUp={onHandleUp}
          onKeyDown={onHandleKey('min')}
        />
        <button
          type="button"
          className="adv-slider-handle"
          style={{ left: `${pct(maxVal)}%` }}
          role="slider"
          aria-label="Maximum price"
          aria-valuemin={domainMin}
          aria-valuemax={domainMax}
          aria-valuenow={maxVal}
          onPointerDown={onHandleDown('max')}
          onPointerMove={onHandleMove('max')}
          onPointerUp={onHandleUp}
          onKeyDown={onHandleKey('max')}
        />
      </div>

      <div className="adv-price-range">
        <label className="adv-price-field">
          <span className="adv-price-field-label">Minimum</span>
          <span className="adv-price-input-wrap">
            <span className="adv-price-symbol" aria-hidden="true">
              {symbol}
            </span>
            <input
              className="adv-price-input"
              type="text"
              inputMode="numeric"
              aria-label="Minimum price"
              value={minDisplay}
              onFocus={(e) => beginEdit('min', e)}
              onBlur={() => setDraft(null)}
              onChange={(e) => editChange('min', e.target.value)}
            />
          </span>
        </label>
        <span className="adv-price-sep" aria-hidden="true">
          –
        </span>
        <label className="adv-price-field">
          <span className="adv-price-field-label">Maximum</span>
          <span className="adv-price-input-wrap">
            <span className="adv-price-symbol" aria-hidden="true">
              {symbol}
            </span>
            <input
              className="adv-price-input"
              type="text"
              inputMode="numeric"
              aria-label="Maximum price"
              value={maxDisplay}
              onFocus={(e) => beginEdit('max', e)}
              onBlur={() => setDraft(null)}
              onChange={(e) => editChange('max', e.target.value)}
            />
          </span>
        </label>
      </div>
    </div>
  )
}

export default function AdvancedFilters({
  advanced,
  histogramCity,
  expanded,
  onToggleExpanded,
  onSetPrice,
  onSetSegment,
  onToggleAmenity,
  onToggleBooking,
  onToggleAccess,
  onClear,
}: Props) {
  const hasPriceRange = advanced.minPrice != null || advanced.maxPrice != null
  const count =
    (hasPriceRange ? 1 : 0) +
    (advanced.wifiSpeed !== 'any' ? 1 : 0) +
    (advanced.minReviews !== 'any' ? 1 : 0) +
    (advanced.minRating !== 'any' ? 1 : 0) +
    advanced.amenities.length +
    advanced.booking.length +
    advanced.access.length

  return (
    <div className={'advanced-filters' + (expanded ? ' is-expanded' : '')}>
      <button
        className="adv-header"
        type="button"
        aria-expanded={expanded}
        onClick={onToggleExpanded}
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
          <div className="adv-group">
            <div className="adv-group-label">Price per night</div>
            <PriceRange
              minPrice={advanced.minPrice}
              maxPrice={advanced.maxPrice}
              city={histogramCity}
              onSetPrice={onSetPrice}
            />
          </div>

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

          <div className="adv-group">
            <div className="adv-group-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="4" r="1.6" /><path d="M6 8.5h12" /><path d="M9 8.5v5l-1.5 6.5" /><path d="M15 8.5v5l1.5 6.5" /><path d="M9 13h6" />
              </svg>
              Accessibility
            </div>
            <div className="adv-chips">
              {ACCESS.map((a) => (
                <button
                  key={a.value}
                  className={'adv-chip' + (advanced.access.includes(a.value) ? ' is-active' : '')}
                  type="button"
                  onClick={() => onToggleAccess(a.value)}
                >
                  <CheckIcon />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="adv-footer">
            <button className="pop-clear" type="button" onClick={onClear}>
              Clear filters
            </button>
            <span className="adv-hint">More filters coming — tell Ada what you'd want</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { SegKey }
