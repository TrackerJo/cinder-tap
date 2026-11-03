import { useState } from 'react'
import './App.css'

function Mark({ small = false }: { small?: boolean }) {
  return <svg width={small ? 22 : 30} height={small ? 22 : 30} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M18 3 5 18h10l-1 11 13-16H17l1-10Z" fill="currentColor" /></svg>
}
function Arrow() { return <span aria-hidden="true">↗</span> }
function App() {
  const [tapped, setTapped] = useState(false)
  return (
    <div className="site">
      <header><a className="brand" href="#" aria-label="CinderTap home"><Mark />CinderTap<span className="brand-dot">®</span></a><a className="nav-link" href="#how-it-works">How it works <span>↘</span></a></header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> A SMALL TILE. A BETTER CHECKOUT.</div><h1 id="hero-title">Goodbye paper.<br />Hello, <span className="serif">tap.</span></h1><p className="intro">Digital receipts. One tap away.<br />No email, no signup, no app to download.</p><button className="primary" onClick={() => setTapped(!tapped)}>{tapped ? 'Try it again' : 'See the tap in action'} <Arrow /></button><p className="micro">A simpler receipt. A lighter footprint.</p></div>
          <div className={`product-scene ${tapped ? 'is-tapped' : ''}`}>
            <div className="scene-label"><span>MEET YOUR NEW RECEIPT</span><span>01 — 03</span></div>
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <button className="tile" onClick={() => setTapped(!tapped)} aria-label={tapped ? 'Reset receipt demo' : 'Tap to see a sample digital receipt'}><span className="tile-brand"><Mark small /> cindertap</span><svg className="nfc" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M29 15a22 22 0 0 1 0 30M37 9a30 30 0 0 1 0 42M21 21a14 14 0 0 1 0 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg><span className="tile-instruction">Tap for your receipt</span><span className="tile-bottom">LESS PAPER. MORE POSSIBILITY.</span></button>
            <div className="phone" aria-live="polite"><div className="phone-island" /><div className="phone-time">9:41 <span>◕ ▰</span></div><div className="receipt"><span className="receipt-flower">✳</span><div className="receipt-shop">The Daily</div><div className="receipt-caption">YOUR NEIGHBORHOOD COFFEE SPOT</div><div className="receipt-check">✓</div><h3>{tapped ? 'Just like that.' : 'You’re all set.'}</h3><p>Your receipt, without the paper.</p><div className="receipt-items"><div><span>Oat milk latte</span><span>$5.50</span></div><div><span>Butter croissant</span><span>$4.00</span></div><div className="receipt-total"><strong>Total</strong><strong>$9.50</strong></div></div><div className="receipt-loyalty">A little thanks for stopping by.<br /><strong>Your next visit just got sweeter. ↗</strong></div><div className="receipt-powered">Powered by CinderTap</div></div><div className="phone-bottom" /></div>
            <div className="tap-prompt"><span className="status-dot" />{tapped ? 'Receipt received. That’s it.' : 'One tap. And you’re on your way.'}</div><div className="demo-label">ILLUSTRATIVE PRODUCT DEMO</div>
          </div>
        </section>
        <section className="compatibility"><span>Built for the checkout you already have.</span><div className="pos-names"><span className="square"><i />Square</span><span className="shopify">▱ shopify</span><span className="clover">✤ clover</span></div><span className="integration-note">Integrations in development</span></section>
        <section className="how" id="how-it-works"><div className="section-top"><span className="eyebrow">LESS FRICTION. FROM START TO FINISH.</span><h2>A tiny change.<br /><span className="serif">A better way to wrap up.</span></h2></div><div className="steps"><article><span className="step-number">01 /</span><h3>Make the sale.</h3><p>CinderTap connects to your existing point-of-sale system. Keep your printer, too.</p></article><article><span className="step-number">02 /</span><h3>Let them tap.</h3><p>Your customer taps their phone on the countertop tile. Their receipt opens in an App Clip.</p></article><article><span className="step-number">03 /</span><h3>Give them a reason to return.</h3><p>Add your brand, loyalty perks, offers, and review links. Make the last touchpoint count.</p></article></div></section>
        <section className="closing"><span className="eyebrow">THOUGHTFULLY SIMPLE.</span><h2>Keep the connection.<br /><span className="serif">Skip the paper.</span></h2><p>Better for your customers. Better for your business.</p><a href="#hero-title">Meet CinderTap <span>↑</span></a></section>
      </main><footer><a className="brand" href="#"><Mark small />CinderTap</a><span>A little tap goes a long way.</span><span>© {new Date().getFullYear()} CinderTap</span></footer>
    </div>
  )
}
export default App
