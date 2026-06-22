import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Currency } from '../data/types'
import { CURRENCIES } from '../data/currency'

const STORAGE_KEY = 'ada_currency_v1'

type CurrencyCtx = { currency: Currency; setCurrency: (c: Currency) => void }

const Ctx = createContext<CurrencyCtx>({ currency: 'USD', setCurrency: () => {} })

function readStored(): Currency {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && (CURRENCIES as string[]).includes(v)) return v as Currency
  } catch {
    /* ignore */
  }
  return 'USD'
}

// Global display currency — a site-wide preference (like Airbnb's), persisted
// across visits. Currency only affects how prices are shown, never which stays
// match, so changing it is always safe and instant everywhere.
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(readStored)

  const setCurrency = useCallback((c: Currency) => setCurrencyState(c), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency)
    } catch {
      /* ignore */
    }
  }, [currency])

  return <Ctx.Provider value={{ currency, setCurrency }}>{children}</Ctx.Provider>
}

export function useCurrency(): CurrencyCtx {
  return useContext(Ctx)
}
