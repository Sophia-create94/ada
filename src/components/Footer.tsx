import CurrencySelect from './CurrencySelect'
import BrandMark from './BrandMark'

// Shared footer — identical on the landing and results pages.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <BrandMark link={false} />
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Product</div>
          <span className="footer-static">Style filters</span>
          <a href="/#how-it-works">How Ada works</a>
          <span className="footer-static">Pricing</span>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Discover</div>
          <span className="footer-static">Editor's picks</span>
          <span className="footer-static">Travel journal</span>
          <span className="footer-static">Trending stays</span>
          <span className="footer-static">Style guide</span>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Support</div>
          <span className="footer-static">Help center</span>
          <span className="footer-static">Contact</span>
          <span className="footer-static">Trust &amp; safety</span>
          <span className="footer-static">Booking partners</span>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© 2026 Ada</div>
        <div className="footer-meta">
          <span>Privacy</span>
          <span>Terms</span>
          <span>English (EU)</span>
          <CurrencySelect className="currency-select--footer" drop="up" />
        </div>
      </div>
    </footer>
  )
}
