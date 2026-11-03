import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'
gsap.registerPlugin(useGSAP, ScrollTrigger)
function Mark({ small = false, dark = false }: { small?: boolean; dark?: boolean }) { return <img className="brand-mark" width={small ? 26 : 36} height={small ? 26 : 36} src={`/brand/cindertap-mark${dark ? "-dark" : ""}.svg`} alt="" aria-hidden="true" /> }
function App() {
 const page = useRef<HTMLDivElement>(null)
 useGSAP(() => {
  const media = gsap.matchMedia()
  media.add('(min-width: 850px) and (prefers-reduced-motion: no-preference)', () => {
   ScrollTrigger.create({ trigger: '.receipt-story', start: 'top 120px', end: 'bottom 75%', pin: '.story-copy', pinSpacing: false })
   gsap.utils.toArray<HTMLElement>('.receipt-card').forEach((card, i) => {
    gsap.from(card, { y: 90, rotation: i ? 5 : -5, scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 45%', scrub: true } })
   })
  })
  return () => media.revert()
 }, { scope: page })
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
 return <div ref={page}><main className="overflow-x-hidden w-full max-w-full"><header className="shell"><a className="brand" href="#" aria-label="CinderTap home"><Mark/>CinderTap</a><nav><a href="#how-it-works">How it works</a><button className="nav-demo" onClick={openDemo}>Watch the demo <span aria-hidden="true">↗</span></button></nav></header>
 <section className="hero shell" id="demo"><div className="hero-copy"><h1 className="max-w-6xl">Tap to pay.<br/><span>Go paperless.</span></h1><div className="hero-detail"><p>Pay with a tap. Get your digital receipt.
A simpler checkout, from start to finish.</p><button className="primary" onClick={openDemo}>Watch the demo <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div>
 <figure className="video-demo"><div className="demo-caption"><span className="live-dot"/> A better checkout, in action <span>↘</span></div>
  <video ref={video} controls autoPlay muted playsInline preload="metadata" poster="/media/cindertap-demo.jpg" aria-label="CinderTap demonstration: tap a phone to receive a digital receipt">
   <source src="/media/cindertap-demo.mp4" type="video/mp4" />
   Your browser does not support video. <a href="/media/cindertap-demo.mp4">Download the demo</a>.
  </video>
  {playbackError && <figcaption aria-live="polite">Use the video controls to start playback.</figcaption>}
 </figure></section>
 <div className="marquee" aria-hidden="true"><div>{Array.from({length: 4}, (_, i) => <span key={i}>Less paper. <i>More possibility.</i> <b>✳</b> </span>)}</div></div>
 <section className="benefits shell" id="how-it-works"><div className="section-heading"><h2>A little tap.<br/>A lighter footprint.</h2><p>Everything you need from checkout.<br/>Nothing extra to carry.</p></div><div className="benefit-grid">{[
 ['Tap to pay', 'Pay with your phone at checkout.', 'tap'],
 ['Get your receipt', 'Your itemized receipt opens on your phone.', 'receipt'],
 ['Keep it handy', 'Save a copy or export it when you need it.', 'save']
 ].map(([title,body,type])=><article key={title} tabIndex={0}><div className={'step-art '+type} aria-hidden="true">{type === 'tap' ? <><div className="tap-phone">✓</div><div className="tap-waves">)))</div></> : type === 'receipt' ? <div className="mini-receipt"><Mark small/><span/><span/><span/><strong>All yours.</strong></div> : <div className="save-folder"><span>↗</span></div>}</div><div className="step-copy"><h3>{title}<span aria-hidden="true">↗</span></h3><p>{body}</p></div></article>)}</div></section>
 <section className="receipt-story shell"><div className="story-copy"><h2>Goodbye, <span className="inline-paper" aria-hidden="true"/> paper trail.</h2><p>A receipt that goes where you go. Ready to save, easy to find, and always within reach.</p><a className="primary" href="/demo/">Explore a sample receipt <span aria-hidden="true">↗</span></a></div><div className="receipt-stack"><div className="receipt-card card-back" aria-hidden="true"><span>CinderTap</span><strong>One less thing<br/>in your pocket.</strong><div className="receipt-lines"/></div><div className="receipt-card card-front"><Mark dark/><span>Your checkout, simplified.</span><strong>Paid.<br/>Saved.<br/><em>Sorted.</em></strong><div className="receipt-bottom">Paperless feels good. <span aria-hidden="true">✓</span></div></div></div></section>
 <footer className="shell"><a className="brand" href="#"><Mark small/>CinderTap</a><a href="/demo/">View a sample receipt ↗</a><span>© 2026 CinderTap</span></footer></main>
 </div>
}
export default App
