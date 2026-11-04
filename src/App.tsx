import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(useGSAP, ScrollTrigger)
import './App.css'
function Mark({ small = false, dark = false }: { small?: boolean; dark?: boolean }) { return <img className="brand-mark" width={small ? 26 : 36} height={small ? 26 : 36} src={`/brand/cindertap-mark${dark ? "-dark" : ""}.svg`} alt="" aria-hidden="true" /> }
function ReceiptHeader() {
 return <div className="receipt-preview-header">
  <strong>THE PIZZA COMPANY</strong><span>THANK YOU FOR YOUR VISIT</span>
  <div className="printed-receipt-meta">ORDER #1042 · TAKEOUT</div>
  <div className="printed-receipt-items">
   <div><span>1 Cheese pizza</span><span>14.00</span></div>
   <div><span>1 Cheesestix</span><span>8.00</span></div>
   <div><span>2 Fountain drinks</span><span>5.00</span></div>
  </div>
  <div className="printed-receipt-totals">
   <div><span>SUBTOTAL</span><span>27.00</span></div>
   <div><span>TAX</span><span>1.89</span></div>
   <div className="printed-receipt-total"><span>TOTAL PAID</span><span>$28.89</span></div>
  </div>
  <div className="printed-receipt-meta">VISA •••• 4242 · APPROVED</div>
 </div>
}
function App() {
 const root = useRef<HTMLDivElement>(null)
 useGSAP(() => {
  const media = gsap.matchMedia()
  media.add('(prefers-reduced-motion: no-preference)', () => {
   gsap.from('.hero-copy > *', { y: 28, opacity: 0, duration: 1, stagger: .12, ease: 'power3.out' })
   // Pin after the section has been read, including on narrow or short screens.
   {
    ScrollTrigger.create({
     trigger: '.hero', start: 'bottom bottom', end: () => `+=${window.innerHeight}`,
     pin: true, pinSpacing: false, invalidateOnRefresh: true,
    })
    gsap.to('.hero-inner', {
     y: -70, scale: .92, opacity: .3, ease: 'none',
     scrollTrigger: { trigger: '.tap-environment', start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
    })
   }
   {
    ScrollTrigger.create({
     trigger: '.benefits-chapter',
     start: () => {
      const chapter = root.current?.querySelector<HTMLElement>('.benefits-chapter')
      return chapter && chapter.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'
     },
     end: () => `+=${window.innerHeight}`,
     pin: true, pinSpacing: false, invalidateOnRefresh: true,
    })
    gsap.to('.benefits', {
     y: -45, scale: .95, opacity: .35, ease: 'none',
     scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
    })
   }
   gsap.utils.toArray<HTMLElement>('.integration-tile').forEach((card, index) => {
    gsap.from(card, {
     y: 65, rotation: index === 0 ? -1.5 : index === 1 ? 2 : -2, scale: .96,
     ease: 'none',
     scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 60%', scrub: .6, invalidateOnRefresh: true },
    })
   })
   gsap.utils.toArray<HTMLElement>('.tap-heading, .section-heading, .closing h2').forEach(heading => {
    gsap.from(heading, {
     y: 45, opacity: .2, ease: 'none',
     scrollTrigger: { trigger: heading, start: 'top 95%', end: 'top 70%', scrub: .5 },
    })
   })
   gsap.from('.tap-display', {
    y: 55, scale: .94, ease: 'none',
    scrollTrigger: { trigger: '.tap-scene', start: 'top 90%', end: 'top 45%', scrub: .6 },
   })
   gsap.from('.closing-brand', {
    yPercent: 35, ease: 'none',
    scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom bottom', scrub: .6 },
   })
   const phone = root.current?.querySelector<HTMLElement>('.tap-handset')
   const tile = root.current?.querySelector<HTMLElement>('.counter-tile')
   if (phone && tile) {
    const sequence = gsap.timeline({ scrollTrigger: { trigger: '.tap-illustration', start: 'top 65%', once: true } })
    sequence
     .to(phone, { x: () => { const a = phone.getBoundingClientRect(); const b = tile.getBoundingClientRect(); return b.left + b.width / 2 - a.left - a.width / 2 }, y: () => { const a = phone.getBoundingClientRect(); const b = tile.getBoundingClientRect(); return b.top + b.height * .2 - a.top }, rotation: -12, scale: .82, duration: .85, ease: 'power2.inOut', delay: .65 })
     .to('.tap-connection', { opacity: 1, scale: 1.15, duration: .25 }, '>-0.1')
     .to('.counter-tile', { scale: .97, duration: .12, yoyo: true, repeat: 1 }, '<')
     .to('.handset-lock-screen', { autoAlpha: 0, duration: .3 }, '+=.25')
     .fromTo('.handset-demo-screen', { autoAlpha: 0, y: 24, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out' }, '<')
     .to(phone, { x: 0, y: 0, rotation: 5, scale: 1, duration: .9, ease: 'power2.inOut' }, '+=.15')
     .to('.tap-connection', { opacity: 0, duration: .35 }, '<')
   }
  })
  return () => media.revert()
 }, { scope: root })
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
 return <div ref={root}><main className="overflow-x-hidden w-full max-w-full"><header className="shell"><a className="brand" href="#" aria-label="CinderTap home"><Mark/>CinderTap</a><nav><a href="#how-it-works">For your business</a><button className="nav-demo" onClick={openDemo}>See it in action <span aria-hidden="true">↗</span></button></nav></header>
 <section className="hero" id="demo"><div className="hero-inner shell"><div className="hero-copy"><h1 className="max-w-6xl">Less paper.<br/><span>More possibility.</span></h1><div className="hero-detail"><p>Turn a simple receipt into your next great customer connection. Reviews, rewards, and reasons to return. All in one tap.</p><div className="hero-actions"><button className="hero-action hero-action-play" onClick={openDemo}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 11 7-11 7V5Z" fill="currentColor"/></svg><span>See it in action</span></button><a className="hero-action hero-action-receipt" href="/demo/"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8h6M9 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>Explore a receipt</span></a></div></div></div>
 <figure className="video-demo"><div className="video-frame">
  <video ref={video} controls muted playsInline preload="metadata" poster="/media/cindertap-demo.jpg" aria-label="CinderTap business demonstration: a customer taps their phone to receive a digital receipt">
   <source src="/media/cindertap-demo.mp4" type="video/mp4" />
   Your browser does not support video. <a href="/media/cindertap-demo.mp4">Download the demo</a>.
  </video></div>{playbackError && <figcaption aria-live="polite">Use the video controls to start playback.</figcaption>}
 </figure></div></section>
 <section className="tap-environment" id="how-it-works" aria-labelledby="tap-heading"><div className="tap-story shell">
 <div className="tap-heading"><h2 id="tap-heading">Tap for your receipt.<br/><span>That’s it.</span></h2></div>
 <div className="tap-scene"><div className="tap-scene-copy"><h3>At the counter.<br/>On your phone.</h3><p>After paying, customers tap their phone on the CinderTap tile. Their receipt opens in an App Clip, with no signup or contact details required.</p></div>
 <div className="tap-display"><div className="tap-display-heading"><span>CinderTap at the counter</span></div><figure className="tap-illustration" aria-label="Concept illustration: a customer taps a phone on the CinderTap countertop tile to open a branded receipt"><div className="tap-counter" aria-hidden="true"/><div className="counter-tile" aria-hidden="true"><Mark dark/><span>Tap for your receipt</span><svg width="27" height="22" viewBox="0 0 32 26" fill="none"><path d="M6 6a16 16 0 0 1 0 14M13 3a23 23 0 0 1 0 20M20 0a30 30 0 0 1 0 26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div className="tap-connection" aria-hidden="true"><span/><span/><span/></div><div className="tap-handset" aria-hidden="true"><div className="handset-camera"/><div className="handset-lock-screen"><svg className="lock-icon" width="18" height="22" viewBox="0 0 18 22" fill="none"><rect x="3" y="9" width="12" height="10" rx="3" fill="currentColor"/><path d="M5 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2"/></svg><span className="lock-date">Tuesday, November 3</span><strong className="lock-time">9:41</strong></div><div className="handset-demo-screen" inert><iframe src="/demo/" title="Pizza Company receipt preview" tabIndex={-1} loading="lazy"/></div><div className="handset-home"/></div></figure></div></div>
 </div></section>
 <div className="benefits-chapter"><section className="benefits shell"><div className="section-heading"><h2>Put more on<br/><span>your receipt.</span></h2></div><div className="benefit-grid">{[
 ['Google reviews', 'Give customers a direct link to review your business on Google.', 'reviews'],
 ['Loyalty programs', 'Link to your existing rewards program so customers can join from their receipt.', 'loyalty'],
 ['Coupons & offers', 'Include an offer customers can save for their next visit.', 'offers']
 ].map(([title,body,type])=><article key={title} className={'integration-tile tile-'+type}><div className="benefit-editorial"><p>{type === 'reviews' ? <>Good visits.<br/><span>Great word of mouth.</span></> : type === 'loyalty' ? <>A familiar face.<br/><span>A reason to return.</span></> : <>Today’s receipt.<br/><span>Tomorrow’s plans.</span></>}</p><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.2"/></svg></div><div className={'step-art integration-art '+type} aria-hidden="true">{type === 'reviews' ? <div className="review-art"><ReceiptHeader/><div className="preview-heading"><img className="google-review-mark" src="/brand/google-g.png" width="24" height="24" alt=""/><span>Google reviews</span></div><strong>How was your visit?</strong><span className="preview-description">Share your experience on Google.</span><div className="review-stars">{[1,2,3,4,5].map(i=><span key={i}>★</span>)}</div><div className="google-review-footer"><span className="google-review-button">Write a review <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></span></div></div> : type === 'loyalty' ? <div className="loyalty-art"><ReceiptHeader/><div className="preview-heading"><span>Your rewards</span></div><strong>One visit closer.</strong><div className="reward-stamps">{[0,1,2,3,4].map(i=><span className={i<3 ? 'filled' : ''} key={i}>{i<3 ? '✓' : i===4 ? '★' : ''}</span>)}</div><div className="preview-action"><span>Explore your rewards</span><span>↗</span></div></div> : <div className="offer-art"><ReceiptHeader/><div className="coupon-main"><span className="coupon-label">Your next visit</span><strong>10<span>%</span> off</strong><span>your next large pizza</span></div><div className="preview-action">Claim your coupon <span>↗</span></div></div>}</div><div className="step-copy"><h3>{title}</h3><p>{body}</p></div></article>)}</div></section></div>
 <section className="closing"><div className="shell"><h2>Give customers<br/>a reason to return<span>.</span></h2><a className="primary" href="/demo/">Try the receipt experience <span aria-hidden="true">↗</span></a><div className="closing-brand" aria-hidden="true"><Mark dark/> CinderTap</div></div></section>
</main>
 </div>
}
export default App
