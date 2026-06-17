import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOOD_TO_STYLE } from '../data/styles'

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
    id: 'storied',
    word: 'Storied',
    meta: 'Ancient walls · local legends · rooms with a past',
    prompt: 'Stays with real history — old riads, merchant houses, places with stories',
    fallback: '#8B5536',
    gradient: 'linear-gradient(160deg, #D8946F 0%, #8B5536 100%)',
  },
  {
    id: 'dreamy',
    word: 'Dreamy',
    meta: 'Countryside views · long walks · soft lighting',
    prompt: 'Something dreamy — countryside, nature, soft light and long walks',
    fallback: '#B89AA6',
    gradient: 'linear-gradient(160deg, #D8C8DC 0%, #B89AA6 100%)',
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
    id: 'wintry',
    word: 'Wintry',
    meta: 'Snowed-in cabins · ski slopes · thick blankets',
    prompt: 'Wintry and cozy — snowed-in cabins, ski slopes, thick blankets by the fire',
    fallback: '#7A8C95',
    gradient: 'linear-gradient(160deg, #CFD8DC 0%, #7A8C95 100%)',
  },
  {
    id: 'quiet',
    word: 'Quiet',
    meta: 'No neighbours · birdsong · slow mornings',
    prompt: 'I want somewhere quiet — no neighbours, birdsong, slow mornings',
    fallback: '#A8B4A0',
    gradient: 'linear-gradient(160deg, #D8DFCD 0%, #A8B4A0 100%)',
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
    const p = new URLSearchParams({ via: 'mood', mood: m.id, q: m.prompt })
    p.set('style', MOOD_TO_STYLE[m.id] || 'modern')
    navigate('/results?' + p.toString())
  }

  return (
    <section className="moods">
      <div className="moods-inner">
        <div className="moods-header">
          <div className="moods-eyebrow">Or start with a feeling</div>
          <h2 className="moods-title">Six vibes Ada knows by heart</h2>
          <p className="moods-subhead">
            Tap a mood and Ada finds five matching stays. The more you use it, the more personal the
            results get.
          </p>
        </div>
        <div className="mood-grid" ref={gridRef} data-scroll-pos="start">
          {MOODS.map((m) => (
            <button
              key={m.id}
              className="mood-tile"
              style={{ ['--fallback' as string]: m.fallback }}
              onClick={() => pick(m)}
            >
              <div className="mood-tile-img" style={{ backgroundImage: m.gradient }} />
              <span className="mood-tile-word">{m.word}</span>
              <span className="mood-tile-meta">{m.meta}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
