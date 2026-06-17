import Header from '../components/Header'
import Footer from '../components/Footer'
import SearchCard from '../components/search/SearchCard'
import ChatCard from '../components/ChatCard'
import Moods from '../components/Moods'

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <h1 className="hero-headline">Stays that match your taste.</h1>
          <p className="hero-subhead">
            Use advanced filters or a single prompt — Ada's AI-powered search finds five stays you'd
            actually book, not 100 to sift through. The more you use it, the better the
            personalization gets.
          </p>

          <SearchCard />

          <div className="or-badge" aria-hidden="true">
            or
          </div>

          <ChatCard />

          <div className="trust-strip">
            <strong>Ada searches</strong>
            <span>Airbnb</span>
            <span className="trust-strip-sep">·</span>
            <span>Booking.com</span>
            <span className="trust-strip-sep">·</span>
            <span>Vrbo</span>
            <span className="trust-strip-sep">·</span>
            <span>Plum Guide</span>
            <span className="trust-strip-sep">·</span>
            <span>Tablet Hotels</span>
          </div>
        </section>

        {/* MOODS */}
        <Moods />

        {/* FEATURES */}
        <section className="features-section">
          <div className="features-head">
            <div className="eyebrow">WHAT MAKES ADA DIFFERENT</div>
            <h2 className="section-title">Search less. Faster results.</h2>
          </div>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">✦</div>
              <div className="feature-title">Gets to know you</div>
              <div className="feature-body">
                Your first search, Ada matches by your filters. Save a place, skip another, make a
                booking — and she starts learning your taste. By your fifth search, Ada already knows
                what you'd skip.
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">◐</div>
              <div className="feature-title">Reads between the photos</div>
              <div className="feature-body">
                Hosts put their best shots first. Ada is trained to catch what comes after — tired
                interiors, misleading angles, rooms that don't quite match the description.
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">◊</div>
              <div className="feature-title">Five picks, not a hundred</div>
              <div className="feature-body">
                Ada shows you a short list of stays that actually fit. No scrolling through pages of
                results. Ask for more if you want to — most people don't need to.
              </div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="how" id="how-it-works">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">HOW ADA WORKS</div>
              <h2 className="section-title">Simple to start. Smarter every time.</h2>
            </div>
            <div className="how-grid">
              <div className="how-step">
                <div className="how-number">01</div>
                <div className="how-step-title">Tell Ada what you're imagining</div>
                <div className="how-step-body">
                  Plain English. Mood, style, budget, constraints — speak the way you'd describe the
                  trip to a friend, not the way you'd fight with filters.
                </div>
              </div>
              <div className="how-step">
                <div className="how-number">02</div>
                <div className="how-step-title">She scans every platform at once</div>
                <div className="how-step-body">
                  Airbnb, Booking, Vrbo, Plum Guide and a dozen others. Ada weights them against your
                  taste and surfaces the five most likely to land.
                </div>
              </div>
              <div className="how-step">
                <div className="how-number">03</div>
                <div className="how-step-title">Book where it's listed</div>
                <div className="how-step-body">
                  Same price as the source platform — Ada doesn't markup, doesn't add fees. You're
                  sent to Airbnb or Booking to complete the booking the way you already trust.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="proof">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">WHAT HAPPENS AFTER TRIP ONE</div>
              <h2 className="section-title">This is what personalization looks like.</h2>
            </div>
            <div className="proof-grid">
              <div className="proof-card">
                <div className="proof-quote">
                  I skipped two of Ada's first picks and saved one. By my third search she'd already
                  stopped showing me the kind of places I'd skip. I didn't have to tell her anything —
                  she just noticed.
                </div>
                <div className="proof-attrib">
                  <div className="proof-avatar" style={{ background: '#7A8B6F' }}>
                    SK
                  </div>
                  <div>
                    <div className="proof-name">Sarah K.</div>
                    <div className="proof-meta">Berlin · 4 trips with Ada</div>
                  </div>
                </div>
              </div>
              <div className="proof-card">
                <div className="proof-quote">
                  My fifth search felt nothing like my first. The first time I got solid options. The
                  fifth time I got the exact place I would have spent three weeks looking for on my
                  own.
                </div>
                <div className="proof-attrib">
                  <div className="proof-avatar" style={{ background: '#5B7B8A' }}>
                    MT
                  </div>
                  <div>
                    <div className="proof-name">Marcus T.</div>
                    <div className="proof-meta">Austin · 7 trips with Ada</div>
                  </div>
                </div>
              </div>
              <div className="proof-card">
                <div className="proof-quote">
                  I booked a place in Lisbon that I never would have found myself — not my usual
                  style, but Ada had been watching what I save for months. She knew before I did.
                </div>
                <div className="proof-attrib">
                  <div className="proof-avatar" style={{ background: '#D896B5' }}>
                    LR
                  </div>
                  <div>
                    <div className="proof-name">Lila R.</div>
                    <div className="proof-meta">Mexico City · 11 trips with Ada</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CTA */}
      <section className="cta-band">
        <div className="cta-band-inner">
          <h2 className="cta-band-title">Stop spending hours on booking sites.</h2>
          <p className="cta-band-body">
            Ada finds five stays you'd actually book. Free to start, better every trip.
          </p>
          <a href="#" className="cta-band-btn">
            Create a free account
          </a>
        </div>
      </section>

      <Footer />
    </>
  )
}
