import BrandMark from './BrandMark'
import CurrencySelect from './CurrencySelect'

// Shared header — identical on the landing and results pages.
export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <BrandMark />
        <nav className="nav">
          <a href="/#how-it-works">How Ada works</a>
        </nav>
        <div className="actions">
          <CurrencySelect className="currency-select--header" />
          <span className="login">
            Log in
          </span>
          <span className="cta-primary cta-static">
            Start free
          </span>
        </div>
      </div>
    </header>
  )
}
