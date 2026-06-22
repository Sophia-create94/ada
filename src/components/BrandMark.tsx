import { Link } from 'react-router-dom'

// Gold house mark (a "place to stay") with the "a" centered, plus wordmark.
// Used in the header (link home) and footer (static, non-clickable via link={false}).
type Props = { link?: boolean }

const mark = (
  <>
    <svg className="brand-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <path
        d="M16 2.5 L28.5 12 L28.5 28 Q28.5 31 25.5 31 L6.5 31 Q3.5 31 3.5 28 L3.5 12 Z"
        fill="currentColor"
      />
      <text x="16" y="24" font-size="15" font-weight="500" text-anchor="middle" fill="var(--on-dark)">a</text>
    </svg>
    <span className="brand-name">ada</span>
  </>
)

export default function BrandMark({ link = true }: Props) {
  if (!link) {
    return <div className="brand brand--static">{mark}</div>
  }
  return (
    <Link to="/" className="brand" aria-label="ada, home">
      {mark}
    </Link>
  )
}
