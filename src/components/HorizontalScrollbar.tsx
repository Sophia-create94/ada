import { useEffect, useRef, useState } from 'react'

type Props = { targetRef: React.RefObject<HTMLDivElement | null> }

// Custom horizontal scrollbar for the homepage carousels. Hidden by default and
// revealed while the user scrolls or hovers the row, then it fades out (like
// macOS overlay scrollbars) so it doesn't feel heavy. Discoverability that the
// row scrolls is carried by the peeking next card + the right-edge fade, per
// carousel UX guidance (avoid the "illusion of completeness").
export default function HorizontalScrollbar({ targetRef }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ widthPct: 0, leftPct: 0, show: false })
  const [active, setActive] = useState(false)
  const hovering = useRef(false)
  const hideTimer = useRef<number | undefined>(undefined)

  const recompute = () => {
    const el = targetRef.current
    if (!el) return
    const { clientWidth, scrollWidth, scrollLeft } = el
    if (scrollWidth <= clientWidth + 1) {
      setThumb((t) => (t.show ? { ...t, show: false } : t))
      return
    }
    setThumb({
      widthPct: (clientWidth / scrollWidth) * 100,
      leftPct: (scrollLeft / scrollWidth) * 100,
      show: true,
    })
  }

  // Reveal the bar, then fade it out after a beat of inactivity (unless hovered).
  const reveal = () => {
    setActive(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      if (!hovering.current) setActive(false)
    }, 1100)
  }

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    const onScroll = () => {
      recompute()
      reveal()
    }
    const onEnter = () => {
      hovering.current = true
      setActive(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
    const onLeave = () => {
      hovering.current = false
      // Fade out immediately on leave (the CSS opacity transition smooths it);
      // the 1100ms linger is only for scroll-without-hover.
      if (hideTimer.current) clearTimeout(hideTimer.current)
      setActive(false)
    }
    recompute()
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', recompute)
    const ro = new ResizeObserver(recompute)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', recompute)
      ro.disconnect()
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef])

  // Drag the thumb to scroll the row.
  const onThumbDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = targetRef.current
    const track = trackRef.current
    if (!el || !track) return
    setActive(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const startX = e.clientX
    const startScroll = el.scrollLeft
    const trackW = track.clientWidth
    const { scrollWidth } = el
    const prevSnap = el.style.scrollSnapType
    el.style.scrollSnapType = 'none' // don't let snap fight the drag
    const onMove = (ev: MouseEvent) => {
      if (trackW > 0) el.scrollLeft = startScroll + ((ev.clientX - startX) / trackW) * scrollWidth
    }
    const onUp = () => {
      el.style.scrollSnapType = prevSnap
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      reveal()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (!thumb.show) return null
  return (
    <div className={'hscrollbar' + (active ? ' is-active' : '')} ref={trackRef} aria-hidden>
      <div
        className="hscrollbar-thumb"
        style={{ width: `${thumb.widthPct}%`, left: `${thumb.leftPct}%` }}
        onMouseDown={onThumbDown}
      />
    </div>
  )
}
