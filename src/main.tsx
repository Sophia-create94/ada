import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'
import ScrollToTop from './components/ScrollToTop'
import BackToTop from './components/BackToTop'
import { CurrencyProvider } from './contexts/CurrencyContext'
import './index.css'

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
