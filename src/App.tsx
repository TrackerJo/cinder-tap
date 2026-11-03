import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import './App.css'
gsap.registerPlugin(ScrollTrigger, useGSAP)
function Mark({ small = false }: { small?: boolean }) { return <svg width={small ? 22 : 30} height={small ? 22 : 30} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M18 3 5 18h10l-1 11 13-16H17l1-10Z" fill="currentColor" /></svg> }
const shops = ['The Daily', 'Corner Store']
function App() {
 const [tapped, setTapped] = useState(false)
 const [receiptIndex, setReceiptIndex] = useState(0)
 const dialog = useRef<HTMLDialogElement>(null)
 const [offerOpen, setOfferOpen] = useState(false)
 function openDemo() {
  resetTap()
  dialog.current?.showModal()
 }
 const [moving, setMoving] = useState(false)
 const demoPhone = useRef<HTMLDivElement>(null)
 const demoTile = useRef<HTMLDivElement>(null)
 const tapTimeline = useRef<gsap.core.Timeline | null>(null)
 function resetTap() {
  tapTimeline.current?.kill()
  gsap.set(demoPhone.current, {x:0,y:0,rotation:0,scale:1})
  gsap.set('.contact-pulse', {scale:.5,opacity:0})
  setMoving(false)
  setTapped(false)
  setOfferOpen(false)
 }
 function animateTap() {
  if (moving || tapped || !demoPhone.current || !demoTile.current) return
  setMoving(true)
  const phone = demoPhone.current.getBoundingClientRect()
  const tile = demoTile.current.getBoundingClientRect()
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  tapTimeline.current = gsap.timeline({onComplete: () => setMoving(false)})
   .to(demoPhone.current, {x:tile.left + tile.width*.65 - phone.left - phone.width*.5,y:tile.top + tile.height*.4 - phone.top - phone.height*.65,scale:.92,duration:reduced ? .01 : .85,rotation:reduced ? 0 : -16,ease:'power2.inOut'})
   .to('.contact-pulse', {opacity:1,scale:1.4,duration:reduced ? .01 : .35}, '>-0.05')
   .call(() => setTapped(true))
   .to('.contact-pulse', {opacity:0,scale:1.9,duration:.3})
   .to(demoPhone.current, {x:0,y:0,rotation:0,scale:1,duration:reduced ? .01 : .8,ease:'power2.inOut'}, '+=.2')
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
 <section className="hero shell" id="demo"><div className="hero-copy"><h1 className="max-w-6xl">The receipt.<br/><span>Reconsidered.</span></h1><div className="hero-detail"><p>A countertop tile. A tap of your phone.<br/>Your receipt, without the paper.</p><button className="primary" onClick={openDemo}>Try the tap <span aria-hidden="true">↗</span></button><p className="micro">No email. No signup. No download.</p></div></div>
          <div className={`product-scene ${tapped ? 'is-tapped' : ''}`}>
            
            
            <button className="tile" onClick={openDemo} aria-label="Open interactive receipt demo"><span className="tile-brand"><Mark small /> cindertap</span><svg className="nfc" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M29 15a22 22 0 0 1 0 30M37 9a30 30 0 0 1 0 42M21 21a14 14 0 0 1 0 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg><span className="tile-instruction">Tap for your receipt</span><span className="tile-bottom">LESS PAPER. MORE POSSIBILITY.</span></button>
            <div className="phone" aria-live="polite"><div className="phone-island" /><div className="phone-time">9:41 <span>◕ ▰</span></div><div className="receipt"><span className="receipt-flower">✳</span><div className="receipt-shop">{shops[receiptIndex]}</div><div className="receipt-caption">DIGITAL RECEIPT</div><div className="receipt-check">✓</div><h3>{tapped ? 'Just like that.' : 'You’re all set.'}</h3><p>Your receipt, without the paper.</p><div className="receipt-items"><div><span>{receiptIndex === 0 ? "Oat milk latte" : "House blend"}</span><span>$5.50</span></div><div><span>Butter croissant</span><span>$4.00</span></div><div className="receipt-total"><strong>Total</strong><strong>$9.50</strong></div></div><div className="receipt-loyalty">A receipt worth keeping.<br /><strong>Your next coffee, on us.</strong></div><div className="receipt-powered">Powered by CinderTap</div></div><div className="phone-bottom" /></div>
            <div className="tap-prompt"><span className="status-dot" />{tapped ? 'Receipt received. That’s it.' : 'Tap the tile to try it.'}</div><div className="demo-label">Illustrative receipt preview</div>
          </div><div className="preview-controls"><span>Sample receipts</span><button aria-label="Previous sample receipt" onClick={() => setReceiptIndex((receiptIndex+1)%2)}>←</button><button aria-label="Next sample receipt" onClick={() => setReceiptIndex((receiptIndex+1)%2)}>→</button></div></section>
 <div className="marquee" aria-label="Tap. Get your receipt. Get on with your day."><div aria-hidden="true">{Array.from({length:4},(_,i)=><span key={i}>Tap. <i>Receipt.</i> Done. <b>↗</b> </span>)}</div></div>
 <section className="benefits shell" id="how-it-works"><div className="section-heading"><p>Less to ask for.<br/>More to come back for.</p><h2>A better end<br/>to every checkout.</h2></div><div className="benefit-grid">{[['No details needed.','Customers tap their phone to open a branded receipt in an App Clip. No email address or phone number to spell out.'],['Your checkout stays.','Designed to connect with existing POS systems, including Square, Shopify, and Clover. Integrations in development.'],['Paper, at your pace.','Works alongside your receipt printer. Let customers choose while your store makes the switch.']].map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>
 <section className="story shell"><article className="story-card story-first"><div><h2>A small footprint.<br/>On your counter, too.</h2><p>One compact tile, right where checkout happens.</p></div><div className="tile-study" aria-label="Illustration of CinderTap countertop tile"><Mark/><span>CinderTap</span><div className="tap-rings">)))</div><small>Tap for your receipt</small></div></article><article className="story-card story-second"><div><h2>The next visit<br/>starts here.</h2><p>Add loyalty perks, offers, reviews, and social links to a receipt that feels like your business.</p></div><div className="loyalty-sample"><span>THE DAILY</span><h3>Your usual.<br/>On us.</h3><div className="coffee-dots"><i/><i/><i/><i/><i/></div><p>Five coffees. One thank you.</p><small>Illustrative loyalty offer</small></div></article></section>
 <section className="closing shell"><h2>All it takes<br/>is a <span className="inline-tile"><Mark small/></span> tap.</h2><button className="closing-demo" onClick={openDemo}>Experience CinderTap <span aria-hidden="true">↗</span></button></section><footer className="shell"><a className="brand" href="#"><Mark small/>CinderTap</a><a href="/demo/">View a sample receipt ↗</a><span>© 2026 CinderTap</span></footer></main>
 <dialog className="demo-dialog phone-demo-dialog" aria-label="Phone tap demonstration" ref={dialog} onClose={resetTap} onClick={event => { if(event.target === event.currentTarget) dialog.current?.close() }}>
  <div className="demo-header"><span>CinderTap <small>Interactive demo</small></span><button aria-label="Close demo" onClick={() => dialog.current?.close()}>×</button></div>
  <div className="demo-content" aria-live="polite">
  <div className="tap-demo-heading"><h2>{tapped ? 'Your receipt. Right there.' : moving ? 'One quick tap.' : 'Watch the phone tap.'}</h2><p>{tapped ? 'No email, signup, or app download.' : 'A sale completes. Your phone meets the tile.'}</p></div>
  <div className={`tap-stage ${tapped ? 'tap-complete' : ''}`}>
   <div className="counter-tile" ref={demoTile}><Mark/><strong>CinderTap</strong><svg viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M29 15a22 22 0 0 1 0 30M37 9a30 30 0 0 1 0 42M21 21a14 14 0 0 1 0 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg><small>Tap for your receipt</small><span className="contact-pulse"/></div>
   <div className="tap-phone" ref={demoPhone}><div className="tap-phone-camera"/>
   {!tapped ? <div className="phone-lock"><span>9:41</span><p>Ready when you are.</p><Mark/><small>Hold near CinderTap</small></div> : <div className="phone-received"><span className="phone-app-label">CinderTap · App Clip preview</span><div className="demo-store">{shops[receiptIndex]}</div><p className="demo-thanks">Thanks for stopping by.</p><div className="demo-receipt-meta">Sample receipt · Paid by card</div><div className="demo-line"><span>{receiptIndex === 0 ? 'Oat milk latte' : 'House blend'}</span><span>$5.50</span></div><div className="demo-line"><span>Butter croissant</span><span>$4.00</span></div><div className="demo-line demo-total"><strong>Total paid</strong><strong>$9.50</strong></div><button className="demo-perk" onClick={() => setOfferOpen(!offerOpen)} aria-expanded={offerOpen}><span>Your next visit<br/><strong>{offerOpen ? 'One coffee, on us.' : 'Open your offer'}</strong></span><span aria-hidden="true">{offerOpen ? '−' : '+'}</span></button>{offerOpen && <div className="demo-offer"><p>Show this receipt for a complimentary coffee.</p><small>Sample offer. Not redeemable.</small></div>}<p className="demo-powered">Powered by CinderTap</p></div>}
   <div className="tap-phone-home"/></div>
  </div>
  <div className="tap-demo-actions"><button className="primary" disabled={moving} onClick={tapped ? resetTap : animateTap}>{moving ? 'Tapping…' : tapped ? 'Replay the tap' : 'Tap phone to tile'} <span aria-hidden="true">↗</span></button><p>A simulated tap and receipt. No NFC required.</p></div>
  </div>
 </dialog></div>
}
export default App
