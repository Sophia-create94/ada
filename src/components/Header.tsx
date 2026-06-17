import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'

// Shared header — identical on the landing and results pages.
export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <BrandMark />
        <nav className="nav">
          <Link to="/" className="active">
            Plan a trip
          </Link>
          <a href="/#how-it-works">How Ada works</a>
        </nav>
        <div className="actions">
          <a href="#" className="login">
            Log in
          </a>
          <a href="#" className="cta-primary">
            Start free
          </a>
        </div>
      </div>
    </header>
  )
}
