import { useEffect, useRef, useState } from 'react'
import { CURRENCIES, CURRENCY_SYMBOL } from '../data/currency'
import { useCurrency } from '../contexts/CurrencyContext'

// Site-wide currency picker — a custom dropdown (not a native <select>) so the
// menu matches Ada's styling. Used in the header (drops down) and footer (up).
export default function CurrencySelect({
  className = '',
  drop = 'down',
}: {
  className?: string
  drop?: 'up' | 'down'
}) {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={'currency-select ' + className} ref={ref}>
      <button
        type="button"
        className="currency-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${currency}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          {CURRENCY_SYMBOL[currency]} {currency}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className={'currency-menu' + (drop === 'up' ? ' currency-menu--up' : '')} role="listbox">
          {CURRENCIES.map((c) => (
            <li key={c}>
              <button
                type="button"
                role="option"
                aria-selected={c === currency}
                className={'currency-option' + (c === currency ? ' is-active' : '')}
                onClick={() => {
                  setCurrency(c)
                  setOpen(false)
                }}
              >
                <span className="currency-option-sym">{CURRENCY_SYMBOL[c]}</span>
                <span className="currency-option-code">{c}</span>
                {c === currency && (
                  <svg className="currency-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
