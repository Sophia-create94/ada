import type { StyleId } from './types'
import { STYLES, styleThumbSVG } from '../../data/styles'

type Props = {
  style: StyleId | null
  onSelect: (id: StyleId) => void
}

export default function StylePopover({ style, onSelect }: Props) {
  return (
    <>
      <div className="pop-section-label">Pick the aesthetic you're chasing</div>
      <div className="style-grid">
        {STYLES.map((s) => (
          <button
            className={'style-item' + (style === s.id ? ' is-selected' : '')}
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
          >
            <div className="style-thumb" dangerouslySetInnerHTML={{ __html: styleThumbSVG(s) }} />
            <div className="style-meta">
              <div className="style-name">{s.name}</div>
              <div className="style-tone">{s.tone}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
