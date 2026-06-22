import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { parseChat } from '../data/parseChat'

// The natural-language entry point — autogrowing textarea + send.
export default function ChatCard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Restore the typed prompt when coming back from a chat search, so the user
  // doesn't have to retype it.
  const [value, setValue] = useState(() =>
    searchParams.get('via') === 'chat' ? searchParams.get('q') ?? '' : '',
  )
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSubmit = value.trim().length > 0

  function autoResize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    let h = el.scrollHeight
    if (el.value === '') {
      // When empty, size to the FULL placeholder so the example is never
      // clipped — at any viewport width (re-measured on resize). The value is
      // swapped in and out synchronously, so it never paints to the user.
      el.value = el.placeholder
      h = Math.max(h, el.scrollHeight)
      el.value = ''
    }
    el.style.height = h + 'px'
  }

  // Size on mount (full placeholder, or a restored prompt) and on every resize.
  useLayoutEffect(() => {
    autoResize()
    window.addEventListener('resize', autoResize)
    return () => window.removeEventListener('resize', autoResize)
  }, [])

  function submit() {
    const typed = value.trim()
    if (!typed) return
    const p = new URLSearchParams({ via: 'chat' })
    p.set('q', typed)
    // Parse the prompt for a destination, style, and guest count so the
    // results actually match what was typed (e.g. "Paris" → Paris stays).
    const parsed = parseChat(typed)
    if (parsed.where) p.set('where', parsed.where)
    else if (parsed.notCovered) p.set('unknown', parsed.notCovered)
    else if (parsed.suggestion) {
      p.set('suggest', parsed.suggestion.name)
      if (parsed.suggestion.covered) p.set('suggestCovered', '1')
    }
    if (parsed.area) p.set('area', parsed.area)
    if (parsed.checkin) p.set('checkin', parsed.checkin)
    if (parsed.checkout) p.set('checkout', parsed.checkout)
    if (parsed.amenities?.length) p.set('amenities', parsed.amenities.join(','))
    if (parsed.tags?.length) p.set('tags', parsed.tags.join(','))
    if (parsed.wifi) p.set('wifi', parsed.wifi)
    if (parsed.style) p.set('style', parsed.style)
    else if (parsed.styleSuggestion) p.set('styleSuggest', parsed.styleSuggestion.id)
    if (parsed.guests) p.set('guests', String(parsed.guests))
    if (parsed.maxPrice) p.set('price', String(parsed.maxPrice))
    navigate('/results?' + p.toString())
  }

  return (
    <div className="ai-card">
      <div className="ai-row">
        <textarea
          className="ai-input"
          ref={ref}
          rows={1}
          placeholder={'Or tell Ada in your own words — for example, "industrial stay in Tokyo, 2 people".'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autoResize()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (canSubmit) submit()
            }
          }}
        />
        <div className="ai-actions">
          <button className="mic-button" aria-label="Voice input" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <button
            className="ai-submit-btn"
            type="button"
            aria-label="Send to Ada"
            disabled={!canSubmit}
            onClick={submit}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
