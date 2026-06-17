import { Link } from 'react-router-dom'

// The "a" tile + wordmark, linking home. Used in the header and footer.
export default function BrandMark() {
  return (
    <Link to="/" className="brand">
      <div className="brand-mark">a</div>
      <div className="brand-name">ada</div>
    </Link>
  )
}
