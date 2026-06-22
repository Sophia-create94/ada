import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import HorizontalScrollbar from './HorizontalScrollbar'

type Mood = {
  id: string
  word: string
  meta: string
  prompt: string
  fallback: string
  gradient: string
}

const MOODS: Mood[] = [
  {
    id: 'sun-soaked',
    word: 'Sun-soaked',
    meta: 'Ocean views · sandy floors · endless summer',
    prompt: 'Sun-soaked beach destination — ocean views, sandy shores, endless summer',
    fallback: '#D38B5A',
    gradient: 'linear-gradient(160deg, #F5C879 0%, #D38B5A 100%)',
  },
  {
    id: 'buzzing',
    word: 'Buzzing',
    meta: 'City buzz · local crowds · corner cafés',
    prompt: 'A buzzing city stay — city buzz, local crowds, corner cafés and street life',
    fallback: '#C9683C',
    gradient: 'linear-gradient(160deg, #F4A878 0%, #C9683C 100%)',
  },
  {
    id: 'nature',
    word: 'Wild',
    meta: 'Jungle canopy · forest trails · mountain air',
    prompt: 'Out in nature — jungle, forest, mountains and rivers, somewhere wild and green',
    fallback: '#5E7A4F',
    gradient: 'linear-gradient(160deg, #A7C796 0%, #5E7A4F 100%)',
  },
  {
    id: 'storied',
    word: 'Storied',
    meta: 'Ancient walls · local legends · rooms with a past',
    prompt: 'Stays with real history — old riads, merchant houses, places with stories',
    fallback: '#8B5536',
    gradient: 'linear-gradient(160deg, #D8946F 0%, #8B5536 100%)',
  },
  {
    id: 'wintry',
    word: 'Wintry',
    meta: 'Snowed-in cabins · ski slopes · thick blankets',
    prompt: 'Wintry and cozy — snowed-in cabins, ski slopes, thick blankets by the fire',
    fallback: '#7A8C95',
    gradient: 'linear-gradient(160deg, #CFD8DC 0%, #7A8C95 100%)',
  },
]

export default function Moods() {
  const navigate = useNavigate()
  const gridRef = useRef<HTMLDivElement>(null)

  // Three-state edge fade: right at start, both mid-scroll, left at end.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    grid.scrollLeft = 0
    grid.dataset.scrollPos = 'start'
    const update = () => {
      const overflows = grid.scrollWidth > grid.clientWidth + 2
      if (!overflows) {
        grid.dataset.scrollPos = 'start'
        return
      }
      const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 4
      const atStart = grid.scrollLeft <= 6
      grid.dataset.scrollPos = atEnd ? 'end' : atStart ? 'start' : 'middle'
    }
    grid.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      grid.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  function pick(m: Mood) {
    // Mood results are matched by setting/climate (the mood tag), not style.
    const p = new URLSearchParams({ via: 'mood', mood: m.id, q: m.prompt })
    navigate('/results?' + p.toString())
  }

  return (
    <div className="browse-block" id="moods">
      <h3 className="browse-block-title">By mood</h3>
      <div className="mood-grid" ref={gridRef} data-scroll-pos="start">
          {MOODS.map((m) => (
            <button
              key={m.id}
              className={`mood-tile mood-tile--${m.id}`}
              style={{ ['--fallback' as string]: m.fallback }}
              onClick={() => pick(m)}
            >
              <div
                className="mood-tile-img"
                style={{ backgroundImage: `url(/assets/mood/mood-${m.id}.jpg), ${m.gradient}` }}
              />
              <span className="mood-tile-word">{m.word}</span>
              <span className="mood-tile-meta">{m.meta}</span>
              <span className="mood-tile-cta">
                Find this mood
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      <HorizontalScrollbar targetRef={gridRef} />
    </div>
  )
}
