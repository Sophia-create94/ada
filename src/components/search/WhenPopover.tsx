import type { WhenSel } from './types'
import { toISO, fmtShort, formatDateRange } from './dateUtils'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type Props = {
  when: WhenSel
  calendarView: Date
  onPrev: () => void
  onNext: () => void
  onSelectDate: (date: Date) => void
  onClear: () => void
}

function MonthGrid({
  monthDate,
  when,
  onSelectDate,
}: {
  monthDate: Date
  when: WhenSel
  onSelectDate: (d: Date) => void
}) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const monthName = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const offset = (first.getDay() + 6) % 7 // Mon-first
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: React.ReactNode[] = []
  for (let i = 0; i < offset; i++) {
    cells.push(<div className="cal-day is-empty" key={'e' + i} />)
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d)
    const iso = toISO(date)
    const isPast = date < today
    const isToday = date.getTime() === today.getTime()
    const classes = ['cal-day']
    if (isToday) classes.push('is-today')
    if (when.start && iso === toISO(when.start)) classes.push('is-start')
    if (when.end && iso === toISO(when.end)) classes.push('is-end')
    if (when.start && when.end && date > when.start && date < when.end) classes.push('is-in-range')
    cells.push(
      <button
        className={classes.join(' ')}
        key={iso}
        type="button"
        disabled={isPast}
        onClick={() => onSelectDate(new Date(iso + 'T00:00:00'))}
      >
        {d}
      </button>,
    )
  }

  return (
    <div className="cal-month">
      <div className="cal-month-title">{monthName}</div>
      <div className="cal-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="cal-days">{cells}</div>
    </div>
  )
}

export default function WhenPopover({
  when,
  calendarView,
  onPrev,
  onNext,
  onSelectDate,
  onClear,
}: Props) {
  const m0 = new Date(calendarView.getFullYear(), calendarView.getMonth(), 1)
  const m1 = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 1)

  let rangeText: React.ReactNode = 'Select your dates'
  if (when.start && when.end) {
    rangeText = <strong>{formatDateRange(when.start, when.end)}</strong>
  } else if (when.start) {
    rangeText = (
      <>
        <strong>{fmtShort(when.start)}</strong> — pick end date
      </>
    )
  }

  return (
    <>
      <div className="cal-head">
        <button className="cal-nav" type="button" aria-label="Previous month" onClick={onPrev}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="cal-range-display">{rangeText}</div>
        <button className="cal-nav" type="button" aria-label="Next month" onClick={onNext}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="cal-months">
        <MonthGrid monthDate={m0} when={when} onSelectDate={onSelectDate} />
        <MonthGrid monthDate={m1} when={when} onSelectDate={onSelectDate} />
      </div>
      <div className="pop-footer">
        <button className="pop-clear" type="button" onClick={onClear}>
          Clear dates
        </button>
      </div>
    </>
  )
}
