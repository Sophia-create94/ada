import { Link } from 'react-router-dom'

// Shared footer — identical on the landing and results pages.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="brand">
            <div className="brand-mark">a</div>
            <div className="brand-name">ada</div>
          </Link>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Product</div>
          <Link to="/">Plan a trip</Link>
          <a href="#">Style filters</a>
          <a href="/#how-it-works">How Ada works</a>
          <a href="#">Pricing</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Discover</div>
          <a href="#">Editor's picks</a>
          <a href="#">Travel journal</a>
          <a href="#">Trending stays</a>
          <a href="#">Style guide</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Support</div>
          <a href="#">Help center</a>
          <a href="#">Contact</a>
          <a href="#">Trust &amp; safety</a>
          <a href="#">Booking partners</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© 2026 Ada</div>
        <div className="footer-meta">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <span>English (EU)</span>
          <span>€ EUR</span>
        </div>
      </div>
    </footer>
  )
}
