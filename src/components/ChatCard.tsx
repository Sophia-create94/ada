import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseChat } from '../data/parseChat'

// The natural-language entry point — autogrowing textarea + send.
export default function ChatCard() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function submit() {
    const typed = value.trim()
    const p = new URLSearchParams({ via: 'chat' })
    if (typed) p.set('q', typed)
    // Parse the prompt for a destination, style, and guest count so the
    // results actually match what was typed (e.g. "Paris" → Paris stays).
    if (typed) {
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
      if (parsed.style) p.set('style', parsed.style)
      if (parsed.guests) p.set('guests', String(parsed.guests))
      if (parsed.maxPrice) p.set('price', String(parsed.maxPrice))
    }
    navigate('/results?' + p.toString())
  }

  return (
    <div className="ai-card">
      <div className="ai-row">
        <div className="ai-avatar">a</div>
        <textarea
          className="ai-input"
          ref={ref}
          rows={1}
          placeholder={'Or tell Ada in your own words — try "vintage farmhouse in Provence"'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            autoResize()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
        <div className="ai-actions">
          <button className="mic-button" aria-label="Voice input" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <button className="ai-submit-btn" type="button" aria-label="Send to Ada" onClick={submit}>
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
