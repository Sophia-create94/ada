import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { City } from '../../data/cities'
import { STYLES } from '../../data/styles'
import type { WhereSel, WhenSel, WhoSel, Advanced, FilterType, StyleId, AmenityId, BookingTag } from './types'
import { toISO, fmtShort, formatDateRange } from './dateUtils'
import WherePopover, { buildWhereItems } from './WherePopover'
import WhenPopover from './WhenPopover'
import WhoPopover from './WhoPopover'
import StylePopover from './StylePopover'
import AdvancedFilters, { type SegKey } from './AdvancedFilters'

const RECENT_WHERE_KEY = 'ada_recent_where_v1'

function getRecents(): City[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_WHERE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function SearchCard() {
  const navigate = useNavigate()

  const [where, setWhere] = useState<WhereSel>(null)
  const [when, setWhen] = useState<WhenSel>({ start: null, end: null })
  const [who, setWho] = useState<WhoSel>({ adults: 0, children: 0, infants: 0, pets: 0 })
  const [style, setStyle] = useState<StyleId | null>(null)
  const [advanced, setAdvanced] = useState<Advanced>({
    wifiSpeed: 'any',
    minReviews: 'any',
    minRating: 'any',
    amenities: [],
    booking: [],
  })

  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null)
  const [popOpen, setPopOpen] = useState(false)
  const [calendarView, setCalendarView] = useState<Date>(() => new Date())

  // WHERE input + keyboard state
  const [whereInput, setWhereInput] = useState('')
  const [whereTyping, setWhereTyping] = useState(false)
  const [whereHighlight, setWhereHighlight] = useState(-1)
  const [recents, setRecents] = useState<City[]>([])

  const wrapRef = useRef<HTMLDivElement>(null)
  const whereInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecents(getRecents())
  }, [])

  /* ---- popover open/close ---- */
  function openFilter(type: FilterType) {
    if (activeFilter === type) {
      if (type === 'where') whereInputRef.current?.focus()
      else closeFilter()
      return
    }
    setActiveFilter(type)
    if (type === 'where') {
      setWhereTyping(false)
      setWhereHighlight(-1)
      // focus after the popover paints
      requestAnimationFrame(() => whereInputRef.current?.focus())
    }
  }

  // Close after committing a selection — keep the input as-is (the committing
  // handler has already set it to the chosen value).
  function closePopover() {
    if (activeFilter === 'where') {
      setWhereTyping(false)
      setWhereHighlight(-1)
      whereInputRef.current?.blur()
    }
    setActiveFilter(null)
  }

  // Close without a selection (outside click / Escape) — revert the input to
  // whatever destination is currently committed.
  function closeFilter() {
    if (activeFilter === 'where') {
      if (!where) setWhereInput('')
      else if (where.flexible) setWhereInput("I'm flexible")
      else setWhereInput(`${where.name}, ${where.country}`)
      setWhereTyping(false)
      setWhereHighlight(-1)
      whereInputRef.current?.blur()
    }
    setActiveFilter(null)
  }

  // Fade-in: add is-open on the frame after the popover mounts.
  useEffect(() => {
    if (!activeFilter) {
      setPopOpen(false)
      return
    }
    const id = requestAnimationFrame(() => setPopOpen(true))
    return () => cancelAnimationFrame(id)
  }, [activeFilter])

  // Outside click + Escape close the popover.
  useEffect(() => {
    if (!activeFilter) return
    function onDocClick(e: MouseEvent) {
      const t = e.target as Element
      if (!document.contains(t)) return
      if (t.closest('.filter-cell') || t.closest('.search-popover')) return
      closeFilter()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeFilter()
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, where])

  /* ---- WHERE handlers ---- */
  function commitCity(city: City) {
    setWhere({ name: city.name, country: city.country })
    setWhereInput(`${city.name}, ${city.country}`)
    // record recent (most-recent first, max 4, no flexible)
    setRecents((prev) => {
      const next = [city, ...prev.filter((r) => !(r.name === city.name && r.country === city.country))].slice(0, 4)
      try {
        localStorage.setItem(RECENT_WHERE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
    closePopover()
  }
  function commitFlexible() {
    setWhere({ name: "I'm flexible", country: null, flexible: true })
    setWhereInput("I'm flexible")
    closePopover()
  }
  function clearWhere() {
    setWhere(null)
    setWhereInput('')
    setWhereTyping(false)
    setWhereHighlight(-1)
    if (activeFilter !== 'where') openFilter('where')
    requestAnimationFrame(() => whereInputRef.current?.focus())
  }
  function onWhereKeyDown(e: React.KeyboardEvent) {
    const items = buildWhereItems(whereTyping ? whereInput : '', recents)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!items.length) return
      setWhereHighlight((whereHighlight + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!items.length) return
      setWhereHighlight(whereHighlight <= 0 ? items.length - 1 : whereHighlight - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = whereHighlight >= 0 && items[whereHighlight] ? items[whereHighlight] : items[0]
      if (!target) return
      if (target.group === 'flexible') commitFlexible()
      else commitCity(target.city)
    } else if (e.key === 'Escape') {
      closeFilter()
    }
  }

  /* ---- WHEN handlers ---- */
  function selectDate(date: Date) {
    setWhen((prev) => {
      if (!prev.start || (prev.start && prev.end)) return { start: date, end: null }
      if (date < prev.start) return { start: date, end: null }
      if (date.getTime() === prev.start.getTime()) return { start: null, end: null }
      return { start: prev.start, end: date }
    })
  }
  // Auto-close once a full range is committed.
  useEffect(() => {
    if (activeFilter === 'when' && when.start && when.end) closeFilter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [when])

  /* ---- WHO handlers ---- */
  const WHO_LIMITS: Record<keyof WhoSel, { min: number; max: number }> = {
    adults: { min: 0, max: 16 },
    children: { min: 0, max: 8 },
    infants: { min: 0, max: 5 },
    pets: { min: 0, max: 5 },
  }
  function stepWho(key: keyof WhoSel, delta: number) {
    setWho((prev) => {
      const { min, max } = WHO_LIMITS[key]
      return { ...prev, [key]: Math.max(min, Math.min(max, prev[key] + delta)) }
    })
  }

  /* ---- ADVANCED handlers ---- */
  function setSegment(key: SegKey, value: string) {
    setAdvanced((p) => ({ ...p, [key]: value }))
  }
  function toggleAmenity(value: AmenityId) {
    setAdvanced((p) => ({
      ...p,
      amenities: p.amenities.includes(value)
        ? p.amenities.filter((a) => a !== value)
        : [...p.amenities, value],
    }))
  }
  function toggleBooking(value: BookingTag) {
    setAdvanced((p) => ({
      ...p,
      booking: p.booking.includes(value)
        ? p.booking.filter((b) => b !== value)
        : [...p.booking, value],
    }))
  }
  function clearAdvanced() {
    setAdvanced({ wifiSpeed: 'any', minReviews: 'any', minRating: 'any', amenities: [], booking: [] })
  }

  /* ---- displays ---- */
  const whereHasValue = !!where
  const whenHasValue = !!(when.start && when.end)
  const whoTotalGuests = who.adults + who.children
  const whoIsDefault = who.adults === 0 && who.children === 0 && who.infants === 0 && who.pets === 0

  let whenDisplay = 'Any week'
  if (when.start && when.end) whenDisplay = formatDateRange(when.start, when.end)
  else if (when.start) whenDisplay = `${fmtShort(when.start)} →`

  let whoDisplay = 'Add guests'
  if (!whoIsDefault) {
    const parts: string[] = []
    if (whoTotalGuests > 0) parts.push(whoTotalGuests === 1 ? '1 guest' : `${whoTotalGuests} guests`)
    if (who.infants > 0) parts.push(`${who.infants} ${who.infants === 1 ? 'infant' : 'infants'}`)
    if (who.pets > 0) parts.push(`${who.pets} ${who.pets === 1 ? 'pet' : 'pets'}`)
    whoDisplay = parts.join(', ')
  }

  const styleName = style ? STYLES.find((s) => s.id === style)?.name ?? 'Any aesthetic' : 'Any aesthetic'

  /* ---- navigation ---- */
  function search() {
    const p = new URLSearchParams({ via: 'filters' })
    if (where) p.set('where', where.flexible ? 'flexible' : where.name)
    if (when.start) p.set('checkin', toISO(when.start))
    if (when.end) p.set('checkout', toISO(when.end))
    if (whoTotalGuests) p.set('guests', String(whoTotalGuests))
    if (who.infants) p.set('infants', String(who.infants))
    if (who.pets) p.set('pets', String(who.pets))
    if (style) p.set('style', style)
    if (advanced.wifiSpeed !== 'any') p.set('wifi', advanced.wifiSpeed)
    if (advanced.minReviews !== 'any') p.set('reviews', advanced.minReviews)
    if (advanced.minRating !== 'any') p.set('rating', advanced.minRating)
    if (advanced.amenities.length) p.set('amenities', advanced.amenities.join(','))
    if (advanced.booking.length) p.set('booking', advanced.booking.join(','))
    navigate('/results?' + p.toString())
  }

  const ClearBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button
      className="filter-clear-btn"
      type="button"
      aria-label={label}
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
  )

  return (
    <div className="search-card-wrap" ref={wrapRef}>
      <div className="search-card">
        <div className="filter-row">
          {/* WHERE */}
          <div
            className={
              'filter-cell filter-cell--input' +
              (activeFilter === 'where' ? ' is-active' : '') +
              (whereHasValue ? ' filter-cell--has-value' : '')
            }
            data-filter="where"
            onClick={() => openFilter('where')}
          >
            <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div className="filter-text">
              <div className="filter-label">WHERE</div>
              <input
                className="filter-value-input"
                ref={whereInputRef}
                type="text"
                placeholder="Anywhere"
                autoComplete="off"
                spellCheck={false}
                value={whereInput}
                onClick={(e) => e.stopPropagation()}
                onFocus={() => {
                  if (activeFilter !== 'where') openFilter('where')
                }}
                onChange={(e) => {
                  setWhereInput(e.target.value)
                  setWhereTyping(true)
                  setWhereHighlight(-1)
                  if (activeFilter !== 'where') openFilter('where')
                }}
                onKeyDown={onWhereKeyDown}
              />
            </div>
            <ClearBtn onClick={clearWhere} label="Clear destination" />
          </div>

          {/* WHEN */}
          <div
            className={
              'filter-cell' +
              (activeFilter === 'when' ? ' is-active' : '') +
              (whenHasValue ? ' filter-cell--has-value' : '')
            }
            data-filter="when"
            onClick={() => openFilter('when')}
          >
            <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="filter-text">
              <div className="filter-label">WHEN</div>
              <div className={'filter-value' + (whenHasValue || when.start ? ' is-set' : '')}>{whenDisplay}</div>
            </div>
            <ClearBtn onClick={() => setWhen({ start: null, end: null })} label="Clear dates" />
          </div>

          {/* WHO */}
          <div
            className={
              'filter-cell' +
              (activeFilter === 'who' ? ' is-active' : '') +
              (!whoIsDefault ? ' filter-cell--has-value' : '')
            }
            data-filter="who"
            onClick={() => openFilter('who')}
          >
            <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <div className="filter-text">
              <div className="filter-label">WHO</div>
              <div className={'filter-value' + (!whoIsDefault ? ' is-set' : '')}>{whoDisplay}</div>
            </div>
            <ClearBtn onClick={() => setWho({ adults: 0, children: 0, infants: 0, pets: 0 })} label="Clear guests" />
          </div>

          {/* STYLE */}
          <div
            className={
              'filter-cell' +
              (activeFilter === 'style' ? ' is-active' : '') +
              (style ? ' filter-cell--has-value' : '')
            }
            data-filter="style"
            onClick={() => openFilter('style')}
          >
            <svg className="filter-icon accent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 22 L12 18.56 L5.82 22 L7 14.14 L2 9.27 L8.91 8.26 Z" />
            </svg>
            <div className="filter-text">
              <div className="filter-label">STYLE</div>
              <div className={'filter-value' + (style ? ' is-set' : '')}>{styleName}</div>
            </div>
            <ClearBtn onClick={() => setStyle(null)} label="Clear aesthetic" />
          </div>

          <button className="filter-search-btn" type="button" aria-label="Search" onClick={search}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <AdvancedFilters
          advanced={advanced}
          onSetSegment={setSegment}
          onToggleAmenity={toggleAmenity}
          onToggleBooking={toggleBooking}
          onClear={clearAdvanced}
        />
      </div>

      {activeFilter && (
        <div className={'search-popover' + (popOpen ? ' is-open' : '')} data-type={activeFilter}>
          {activeFilter === 'where' && (
            <WherePopover
              query={whereTyping ? whereInput : ''}
              recents={recents}
              highlight={whereHighlight}
              onSelectFlexible={commitFlexible}
              onSelectCity={commitCity}
              onHover={setWhereHighlight}
            />
          )}
          {activeFilter === 'when' && (
            <WhenPopover
              when={when}
              calendarView={calendarView}
              onPrev={() => setCalendarView((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              onNext={() => setCalendarView((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              onSelectDate={selectDate}
              onClear={() => setWhen({ start: null, end: null })}
            />
          )}
          {activeFilter === 'who' && <WhoPopover who={who} onStep={stepWho} />}
          {activeFilter === 'style' && (
            <StylePopover
              style={style}
              onSelect={(id) => {
                setStyle(id)
                closeFilter()
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
