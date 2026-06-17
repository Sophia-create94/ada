import type { WhoSel } from './types'

type WhoRow = { id: keyof WhoSel; name: string; meta: string; min: number; max: number }

const WHO_ROWS: WhoRow[] = [
  { id: 'adults', name: 'Adults', meta: 'Ages 13 or above', min: 0, max: 16 },
  { id: 'children', name: 'Children', meta: 'Ages 2 – 12', min: 0, max: 8 },
  { id: 'infants', name: 'Infants', meta: 'Under 2', min: 0, max: 5 },
  { id: 'pets', name: 'Pets', meta: '', min: 0, max: 5 },
]

type Props = {
  who: WhoSel
  onStep: (key: keyof WhoSel, delta: number) => void
}

export default function WhoPopover({ who, onStep }: Props) {
  return (
    <>
      {WHO_ROWS.map((r) => (
        <div className="who-row" key={r.id}>
          <div className="who-label">
            <div className="who-name">{r.name}</div>
            {r.meta ? <div className="who-meta">{r.meta}</div> : null}
          </div>
          <div className="who-stepper">
            <button
              className="who-btn"
              type="button"
              disabled={who[r.id] <= r.min}
              onClick={() => onStep(r.id, -1)}
            >
              −
            </button>
            <span className="who-count">{who[r.id]}</span>
            <button
              className="who-btn"
              type="button"
              disabled={who[r.id] >= r.max}
              onClick={() => onStep(r.id, 1)}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </>
  )
}

export { WHO_ROWS }
