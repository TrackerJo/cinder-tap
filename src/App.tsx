import { useRef, useState } from 'react'
import './App.css'
function Mark({ small = false, dark = false }: { small?: boolean; dark?: boolean }) { return <img className="brand-mark" width={small ? 26 : 36} height={small ? 26 : 36} src={`/brand/cindertap-mark${dark ? "-dark" : ""}.svg`} alt="" aria-hidden="true" /> }
function App() {
 const video = useRef<HTMLVideoElement>(null)
 const [playbackError, setPlaybackError] = useState(false)
 function openDemo() {
  const player = video.current
  if (!player) return
  player.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'})
  if (player.ended) player.currentTime = 0
  setPlaybackError(false)
  void player.play().catch(() => setPlaybackError(true))
 }
 return <div><main className="overflow-x-hidden w-full max-w-full"><header className="shell"><a className="brand" href="#" aria-label="CinderTap home"><Mark/>CinderTap</a><nav><a href="#how-it-works">For your business</a><button className="nav-demo" onClick={openDemo}>See it in action <span aria-hidden="true">↗</span></button></nav></header>
 <section className="hero shell" id="demo"><div className="hero-copy"><h1 className="max-w-6xl">Your checkout.<br/><span>Less paper.</span></h1><div className="hero-detail"><p>A digital receipt that connects customers to your Google reviews, loyalty program, and next-visit offers.</p><button className="primary" onClick={openDemo}>See it in action <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div>
 <figure className="video-demo"><div className="demo-caption"><span className="live-dot"/> See the customer experience <span>↘</span></div>
  <video ref={video} controls autoPlay muted playsInline preload="metadata" poster="/media/cindertap-demo.jpg" aria-label="CinderTap business demonstration: a customer taps their phone to receive a digital receipt">
   <source src="/media/cindertap-demo.mp4" type="video/mp4" />
   Your browser does not support video. <a href="/media/cindertap-demo.mp4">Download the demo</a>.
  </video>
  {playbackError && <figcaption aria-live="polite">Use the video controls to start playback.</figcaption>}
 </figure></section>
 <div className="marquee" aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>Digital receipts. <i>Reasons to return.</i> <b>✳</b> </span>)}</div></div>
 <section className="benefits shell" id="how-it-works"><div className="section-heading"><h2>More than<br/>proof of purchase.</h2></div><div className="benefit-grid">{[
 ['Google reviews', 'Put a direct link to your Google review page on every receipt.', 'reviews'],
 ['Loyalty programs', 'Connect customers to your existing rewards signup in one tap.', 'loyalty'],
 ['Coupons & offers', 'Give customers a next-visit offer they can save and come back for.', 'offers']
 ].map(([title,body,type])=><article key={title}><div className={'step-art integration-art '+type} aria-hidden="true">{type === 'reviews' ? <div className="review-art"><span className="integration-google">G</span><span className="integration-stars">★★★★★</span><span>Leave a Google review</span></div> : type === 'loyalty' ? <div className="loyalty-art"><strong>Good to have you back.</strong><div>{[0,1,2,3,4].map(i=><span className={i<3 ? 'filled' : ''} key={i}>{i<3 ? '✓' : '·'}</span>)}</div><span>Your loyalty program ↗</span></div> : <div className="offer-art"><strong>10% off</strong><span>your next large pizza</span><span>Claim coupon ↗</span></div>}</div><div className="step-copy"><h3>{title}</h3><p>{body}</p></div></article>)}</div></section>
 <section className="receipt-story integration-story shell"><div className="story-copy"><h2>Give them a reason<br/>to come back.</h2><p>Keep your brand front and center. Add links to Google reviews, your loyalty program, and coupons—all alongside the receipt.</p><p className="integration-note">Your existing programs. One place for customers to find them.</p><a className="primary" href="/demo/">Explore the receipt demo <span aria-hidden="true">↗</span></a></div><div className="receipt-example"><div className="example-merchant"><img src="/brand/mad-mushroom-logo.png" alt="Mad Mushroom" width="240" height="54"/></div><div className="example-content"><div className="example-summary"><span>Your receipt <small>#CT-1042</small></span><div><span>Cheese pizza, Cheesestix & drinks</span><strong>$28.89</strong></div></div><a className="example-review" href="/demo/"><span className="integration-google">G</span><div><strong>How was your visit?</strong><span className="integration-stars">★★★★★</span><span>Leave a review on Google</span></div><span>↗</span></a><div className="example-loyalty"><span>Loyalty signup</span><strong>Your rewards program, one tap away.</strong><span>Link customers to your existing program.</span></div><a className="example-offer" href="/demo/"><div><strong>10% OFF</strong><span>A large pizza.</span></div><span>Claim coupon ↗</span></a><span className="example-caption">Illustrative receipt · Preview the live demo</span></div></div></section>
 <footer className="shell"><a className="brand" href="#"><Mark small/>CinderTap</a><a href="/demo/">Preview the customer receipt ↗</a><span>© 2026 CinderTap</span></footer></main>
 </div>
}
export default App
