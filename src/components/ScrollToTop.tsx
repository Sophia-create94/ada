import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Reset scroll to the top on client-side route changes (React Router doesn't do
// this on its own), so "Back to Ada" lands at the top of the homepage like a
// fresh load. When the URL carries a hash (e.g. /?…#moods on a mood "back"),
// scroll that section into view instead — the browser doesn't do this on SPA nav.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
