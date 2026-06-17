import type { City } from '../../data/cities'
import { CITIES, CITY_ICONS, CITY_COLORS } from '../../data/cities'

export type WhereItem =
  | { group: 'flexible'; key: string }
  | { group: 'recent' | 'suggested'; key: string; city: City }

// Flat, ordered list of selectable WHERE rows — shared by the popover render
// and the keyboard-navigation handler so highlight indices line up.
export function buildWhereItems(query: string, recents: City[]): WhereItem[] {
  const q = query.trim().toLowerCase()
  if (q) {
    return CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
    ).map((c) => ({ group: 'suggested', key: c.name, city: c }))
  }
  const items: WhereItem[] = [{ group: 'flexible', key: 'flexible' }]
  recents.forEach((c) => items.push({ group: 'recent', key: 'r-' + c.name, city: c }))
  CITIES.forEach((c) => items.push({ group: 'suggested', key: c.name, city: c }))
  return items
}

function CityThumb({ name }: { name: string }) {
  const bg = CITY_COLORS[name] || CITY_COLORS.flexible
  return (
    <div className="where-item-thumb" style={{ backgroundColor: bg }}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: CITY_ICONS[name] || '' }}
      />
    </div>
  )
}

type Props = {
  query: string
  recents: City[]
  highlight: number
  onSelectFlexible: () => void
  onSelectCity: (city: City) => void
  onHover: (idx: number) => void
}

export default function WherePopover({
  query,
  recents,
  highlight,
  onSelectFlexible,
  onSelectCity,
  onHover,
}: Props) {
  const items = buildWhereItems(query, recents)

  if (items.length === 0) {
    return (
      <>
        <div className="pop-section-label">Suggested destinations</div>
        <div
          style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
          }}
        >
          No cities match — try a different word.
        </div>
      </>
    )
  }

  const rows: React.ReactNode[] = []
  let prevGroup: WhereItem['group'] | null = null

  items.forEach((item, idx) => {
    // Section labels appear when the group changes.
    if (item.group !== prevGroup) {
      if (item.group === 'recent') {
        rows.push(
          <div className="pop-section-label" key="lbl-recent" style={{ marginTop: '14px' }}>
            Recent searches
          </div>,
        )
      } else if (item.group === 'suggested') {
        rows.push(
          <div className="pop-section-label" key="lbl-suggested" style={prevGroup ? { marginTop: '14px' } : undefined}>
            Suggested destinations
          </div>,
        )
      }
      prevGroup = item.group
    }

    const cls = 'where-item' + (highlight === idx ? ' is-highlighted' : '')

    if (item.group === 'flexible') {
      rows.push(
        <button
          className={cls + ' where-item--flexible'}
          key={item.key}
          type="button"
          onMouseEnter={() => onHover(idx)}
          onClick={onSelectFlexible}
        >
          <CityThumb name="flexible" />
          <div className="where-item-text">
            <div className="where-item-name">I'm flexible</div>
            <div className="where-item-meta">Open to anywhere</div>
          </div>
        </button>,
      )
    } else {
      const c = item.city
      rows.push(
        <button
          className={cls}
          key={item.key}
          type="button"
          onMouseEnter={() => onHover(idx)}
          onClick={() => onSelectCity(c)}
        >
          <CityThumb name={c.name} />
          <div className="where-item-text">
            <div className="where-item-name">{c.name}</div>
            <div className="where-item-meta">{c.country}</div>
          </div>
        </button>,
      )
    }
  })

  return <div className="where-list">{rows}</div>
}
