import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './App.css'
gsap.registerPlugin(useGSAP)
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
 useGSAP(() => () => { tapTimeline.current?.kill() }, {scope:root})
 return <div ref={root}><main className="overflow-x-hidden w-full max-w-full"><header className="shell"><a className="brand" href="#" aria-label="CinderTap home"><Mark/>CinderTap</a><nav><a href="#how-it-works">How it works</a><button className="nav-demo" onClick={openDemo}>Try the demo <span aria-hidden="true">↗</span></button></nav></header>
 <section className="hero shell" id="demo"><div className="hero-copy"><h1 className="max-w-6xl">Receipts.<br/><span>One tap away.</span></h1><div className="hero-detail"><p>Tap your phone. Take your receipt.
No paper, email, or app required.</p><button className="primary" onClick={openDemo}>Try the demo <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div>
          <div className={`product-scene ${tapped ? 'is-tapped' : ''}`}>
            
            
            <button className="tile" ref={demoTile} onClick={openDemo} aria-label="Run interactive receipt demo" aria-disabled={moving}><span className="tile-brand"><Mark small dark /> CinderTap</span><svg className="nfc" viewBox="0 0 60 60" fill="none" aria-hidden="true"><path d="M29 15a22 22 0 0 1 0 30M37 9a30 30 0 0 1 0 42M21 21a14 14 0 0 1 0 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg><span className="tile-instruction">Tap for your receipt</span><span className="contact-pulse"/></button>
            <div className={`phone ${tapped ? 'phone-open' : 'phone-locked'}`} ref={demoPhone}>
              <div className="phone-island" />
              {tapped ? <><div className="phone-time">9:41 <span>◕ ▰</span></div><div className="phone-site"><iframe src="/demo/" title="Interactive Mad Mushroom sample receipt" /></div></> : <div className="lock-screen" aria-label="Phone lock screen, ready to tap">
                <svg className="lock-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5"/></svg>
                <span className="lock-date">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
                <span className="lock-time">9:41</span>
                <div className="lock-hint"><Mark small dark/><span>Tap the tile<br/>to get your receipt</span></div>
                
              </div>}
              <div className="phone-bottom" />
            </div>
            <div className="tap-prompt"><span className="status-dot" />{moving ? 'One quick tap…' : tapped ? 'Your receipt is ready.' : 'Tap the tile to begin.'}</div><div className="demo-label" aria-live="polite">{tapped ? <a href="/demo/">Open sample receipt full screen ↗</a> : 'A sample checkout experience'}</div>
          </div></section>
 <section className="benefits shell" id="how-it-works"><div className="benefit-grid">{[
 ['Tap at checkout', 'Hold your phone near the CinderTap tile.'],
 ['Get your receipt', 'Your itemized receipt opens on your phone.'],
 ['Keep it handy', 'Save a copy or export it when you need it.']
 ].map(([title,body])=><article key={title}><h2>{title}</h2><p>{body}</p></article>)}</div></section>
 <footer className="shell"><a className="brand" href="#"><Mark small/>CinderTap</a><a href="/demo/">View a sample receipt ↗</a><span>© 2026 CinderTap</span></footer></main>
 </div>
}
export default App
