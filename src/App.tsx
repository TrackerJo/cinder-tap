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
 return <div><main className="overflow-x-hidden w-full max-w-full"><header className="shell"><a className="brand" href="#" aria-label="CinderTap home"><Mark/>CinderTap</a><nav><a href="#how-it-works">How it works</a><button className="nav-demo" onClick={openDemo}>Watch the demo <span aria-hidden="true">↗</span></button></nav></header>
 <section className="hero shell" id="demo"><div className="hero-copy"><h1 className="max-w-6xl">Tap to pay.<br/><span>Go paperless.</span></h1><div className="hero-detail"><p>Pay with a tap. Get your digital receipt.
A simpler checkout, from start to finish.</p><button className="primary" onClick={openDemo}>Watch the demo <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button></div></div>
 <figure className="video-demo">
  <video ref={video} controls autoPlay muted playsInline preload="metadata" poster="/media/cindertap-demo.jpg" aria-label="CinderTap demonstration: tap a phone to receive a digital receipt">
   <source src="/media/cindertap-demo.mp4" type="video/mp4" />
   Your browser does not support video. <a href="/media/cindertap-demo.mp4">Download the demo</a>.
  </video>
  {playbackError && <figcaption aria-live="polite">Use the video controls to start playback.</figcaption>}
 </figure></section>
 <section className="benefits shell" id="how-it-works"><div className="benefit-grid">{[
 ['Tap to pay', 'Pay with your phone at checkout.'],
 ['Get your receipt', 'Your itemized receipt opens on your phone.'],
 ['Keep it handy', 'Save a copy or export it when you need it.']
 ].map(([title,body])=><article key={title}><h2>{title}</h2><p>{body}</p></article>)}</div></section>
 <footer className="shell"><a className="brand" href="#"><Mark small/>CinderTap</a><a href="/demo/">View a sample receipt ↗</a><span>© 2026 CinderTap</span></footer></main>
 </div>
}
export default App
