import { useEffect, useRef, useState } from 'react'

// Floating button that appears once the user has scrolled down and smooth-
// scrolls back to the top. Rendered globally, so it works on every page.
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  // Inverts to a light circle while it overlaps the dark CTA band, so the dark
  // default circle doesn't disappear against the dark background.
  const [inverted, setInverted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 500)
      const band = document.querySelector('.cta-band')
      const btn = btnRef.current
      if (!band || !btn) {
        setInverted(false)
        return
      }
      const b = band.getBoundingClientRect()
      const r = btn.getBoundingClientRect()
      // Invert while the button's box vertically overlaps the dark band.
      setInverted(b.top < r.bottom && b.bottom > r.top)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <button
      ref={btnRef}
      type="button"
      className={'back-to-top' + (visible ? ' is-visible' : '') + (inverted ? ' is-inverted' : '')}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  )
}
