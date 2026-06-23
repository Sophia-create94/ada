import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import ScrollToTop from './components/ScrollToTop'
import BackToTop from './components/BackToTop'
import { CurrencyProvider } from './contexts/CurrencyContext'
import './index.css'

// When embedded in a frame (e.g. the portfolio phone mockup), add a top
// safe-area inset so the header clears a device notch and content still scrolls
// all the way to the top edge. No effect for normal, unframed visitors.
try {
  if (window.self !== window.top) document.body.classList.add('in-frame')
} catch {
  document.body.classList.add('in-frame')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurrencyProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
        </Routes>
        <BackToTop />
      </BrowserRouter>
    </CurrencyProvider>
  </React.StrictMode>,
)
