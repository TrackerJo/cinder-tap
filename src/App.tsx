import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './App.css'
gsap.registerPlugin(ScrollTrigger, useGSAP)
function Mark({ small = false, dark = false }: { small?: boolean; dark?: boolean }) { return <img className="brand-mark" width={small ? 26 : 36} height={small ? 26 : 36} src={`/brand/cindertap-mark${dark ? "-dark" : ""}.svg`} alt="" aria-hidden="true" /> }
function App() {
 const [tapped, setTapped] = useState(false)
 function openDemo() {
  if (moving) return
  demoPhone.current?.closest('.product-scene')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'})
  resetTap()
  animateTap()
 }
 const [moving, setMoving] = useState(false)
 const demoPhone = useRef<HTMLDivElement>(null)
 const demoTile = useRef<HTMLButtonElement>(null)
 const tapTimeline = useRef<gsap.core.Timeline | null>(null)
 function resetTap() {
  tapTimeline.current?.kill()
  gsap.set(demoPhone.current, {x:0,y:0,rotation:10,scale:1})
  gsap.set('.contact-pulse', {scale:.5,opacity:0})
  setMoving(false)
  setTapped(false)
 }
 function animateTap() {
  if (moving || !demoPhone.current || !demoTile.current) return
  setMoving(true)
  const phone = demoPhone.current.getBoundingClientRect()
  const tile = demoTile.current.getBoundingClientRect()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  tapTimeline.current = gsap.timeline({onComplete: () => setMoving(false)})
   .to(demoPhone.current, {x:tile.left + tile.width*.65 - phone.left - phone.width*.5,y:tile.top + tile.height*.4 - phone.top - phone.height*.65,scale:.92,duration:reduced ? .01 : .85,rotation:reduced ? 10 : -6,ease:'power2.inOut'})
   .to('.contact-pulse', {opacity:1,scale:1.4,duration:reduced ? .01 : .35}, '>-0.05')
   .call(() => setTapped(true))
   .to('.contact-pulse', {opacity:0,scale:1.9,duration:.3})
   .to(demoPhone.current, {x:0,y:0,rotation:10,scale:1,duration:reduced ? .01 : .8,ease:'power2.inOut'}, '+=.2')
 }
 const root = useRef<HTMLDivElement>(null)
 useGSAP(() => {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
   gsap.fromTo('.product-scene', {scale:.8}, {scale:1, ease:'none', scrollTrigger:{trigger:'.hero',start:'top 80%',end:'center center',scrub:1}})
   gsap.to('.product-scene', {opacity:.2, ease:'none',scrollTrigger:{trigger:'.hero',start:'bottom 30%',end:'bottom top',scrub:1}})
   if(window.innerWidth > 760) gsap.utils.toArray<HTMLElement>('.story-card').forEach((card,i,cards) => { if(i < cards.length-1) ScrollTrigger.create({trigger:card,start:'top 110px',endTrigger:'.story',end:'bottom 85%',pin:true,pinSpacing:false}) })
  })
  return () => mm.revert()
 }, {scope:root})
 return <div ref={root}><main className="overflow-x-hidden w-full max-w-full"><header className="shell"><a className="brand" href="#" aria-label="CinderTap home"><Mark/>CinderTap</a><nav><a href="#how-it-works">The idea</a><button className="nav-demo" onClick={openDemo}>Try the tap <span aria-hidden="true">↗</span></button></nav></header>
 <section className="hero shell" id="demo"><div className="hero-copy"><h1 className="max-w-6xl">The receipt.<br/><span>Reconsidered.</span></h1><div className="hero-detail"><p>A countertop tile. A tap of your phone.<br/>Your receipt, without the paper.</p><button className="primary" onClick={openDemo}>Try the tap <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div>
          <div className={`product-scene ${tapped ? 'is-tapped' : ''}`}>
            
            
            <button className="tile" ref={demoTile} onClick={openDemo} aria-label="Run interactive receipt demo" aria-disabled={moving}><span className="tile-brand"><Mark small dark /> CinderTap</span><svg className="nfc" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M29 15a22 22 0 0 1 0 30M37 9a30 30 0 0 1 0 42M21 21a14 14 0 0 1 0 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg><span className="tile-instruction">Tap for your receipt</span><span className="tile-bottom">LESS PAPER. MORE POSSIBILITY.</span><span className="contact-pulse"/></button>
            <div className={`phone ${tapped ? 'phone-open' : 'phone-locked'}`} ref={demoPhone}>
              <div className="phone-island" />
              {tapped ? <><div className="phone-time">9:41 <span>◕ ▰</span></div><div className="phone-site"><iframe src="/demo/" title="Interactive Mad Mushroom sample receipt" /></div></> : <div className="lock-screen" aria-label="Phone lock screen, ready to tap">
                <svg className="lock-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
                <span className="lock-date">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
                <span className="lock-time">9:41</span>
                <div className="lock-hint"><Mark small dark/><span>Tap the tile<br/>to get your receipt</span></div>
                <div className="lock-shortcuts" aria-hidden="true"><span>☼</span><span>◎</span></div>
              </div>}
              <div className="phone-bottom" />
            </div>
            <div className="tap-prompt"><span className="status-dot" />{moving ? 'One quick tap…' : tapped ? 'Receipt received. Tap to replay.' : 'Tap the tile to try it.'}</div><div className="demo-label" aria-live="polite">{tapped ? <a href="/demo/">Open sample receipt full screen ↗</a> : 'Interactive tap demo'}</div>
          </div></section>
 <div className="marquee" aria-label="Tap. Get your receipt. Get on with your day."><div aria-hidden="true">{Array.from({length:4},(_,i)=><span key={i}>Tap. <i>Receipt.</i> Done. <b>↗</b> </span>)}</div></div>
 <section className="benefits shell" id="how-it-works"><div className="section-heading"><p>Less to ask for.<br/>More to come back for.</p><h2>A better end<br/>to every checkout.</h2></div><div className="benefit-grid">{[['No details needed.','Customers tap their phone to open a branded receipt in an App Clip. No email address or phone number to spell out.'],['Your checkout stays.','Designed to connect with existing POS systems, including Square, Shopify, and Clover. Integrations in development.'],['Paper, at your pace.','Works alongside your receipt printer. Let customers choose while your store makes the switch.']].map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>
 <section className="story shell"><article className="story-card story-first"><div><h2>A small footprint.<br/>On your counter, too.</h2><p>One compact tile, right where checkout happens.</p></div><div className="tile-study" aria-label="Illustration of CinderTap countertop tile"><Mark dark/><span>CinderTap</span><div className="tap-rings">)))</div><small>Tap for your receipt</small></div></article><article className="story-card story-second"><div><h2>The next visit<br/>starts here.</h2><p>Add loyalty perks, offers, reviews, and social links to a receipt that feels like your business.</p></div><div className="loyalty-sample"><span>THE DAILY</span><h3>Your usual.<br/>On us.</h3><div className="coffee-dots"><i/><i/><i/><i/><i/></div><p>Five coffees. One thank you.</p><small>Illustrative loyalty offer</small></div></article></section>
 <section className="closing shell"><h2>All it takes<br/>is a <span className="inline-tile"><Mark small dark/></span> tap.</h2><button className="closing-demo" onClick={openDemo}>Experience CinderTap <span aria-hidden="true">↗</span></button></section><footer className="shell"><a className="brand" href="#"><Mark small/>CinderTap</a><a href="/demo/">View a sample receipt ↗</a><span>© 2026 CinderTap</span></footer></main>
 </div>
}
export default App
