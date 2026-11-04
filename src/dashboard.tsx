import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { auth, db } from './firebase'
import { parseText, printerText, storedReceipt, validateReceipt } from './receipt-parser'
import { samples } from './receipt-samples'
import { money } from './receipt-model'
import type { Receipt } from './receipt-model'
import './typography.css'
import './dashboard.css'
type Business = Receipt['merchant'] & { id: string; ownerId: string; currency: string; timeZone: string }
type Stored = { id: string; businessId: string; receipt: Receipt; createdAt?: { seconds: number } }
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'
const receiptLink = (id: string) => `${window.location.origin}/template/?receipt=${encodeURIComponent(id)}`
function Dashboard() {
  const [user, setUser] = useState<User | null>(null), [ready, setReady] = useState(false)
  const [view, setView] = useState<'businesses' | 'business-form' | 'business' | 'receipt'>('businesses')
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState<Business[]>([]), [receipts, setReceipts] = useState<Stored[]>([])
  const [businessId, setBusinessId] = useState(''), [draft, setDraft] = useState(''), [warnings, setWarnings] = useState<string[]>([])
  const [reviewed, setReviewed] = useState(false), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [lastLink, setLastLink] = useState('')
  const business = businesses.find(b => b.id === businessId)
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setReady(true); setBusinesses([]); setReceipts([]); setBusinessId(''); setDraft(''); setLastLink(''); setView('businesses'); setLoading(!!u) }), [])
  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([getDocs(query(collection(db,'businesses'),where('ownerId','==',user.uid))), getDocs(query(collection(db,'receipts'),where('ownerId','==',user.uid)))]).then(([b,r]) => {
      if (!active) return
      const next = b.docs.map(d => ({...d.data(), id:d.id}) as Business)
      setBusinesses(next)
      setReceipts(r.docs.map(d => ({...d.data(), id:d.id}) as Stored).sort((a,b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)))
    }).catch(e => { if(active) setNotice(errorText(e)) }).finally(() => { if(active) setLoading(false) })
    return () => { active = false }
  }, [user])
  function merchant(): Receipt['merchant'] {
    if (!business) throw new Error('Select a business first.')
    return { name: business.name, ...(business.address ? {address:business.address}:{}), ...(business.phone ? {phone:business.phone}:{}), ...(business.website ? {website:business.website}:{}) }
  }
  function parseDraft(): Receipt { const receipt = validateReceipt(JSON.parse(draft)); return {...receipt, merchant:merchant()} }
  let validation = '', parsed: Receipt | undefined
  if (draft) { try { parsed = parseDraft() } catch (e) { validation = errorText(e) } }
  async function account(form: HTMLFormElement, action: 'signin' | 'signup' | 'reset') {
    setBusy(true); setNotice('')
    const data = new FormData(form), email = String(data.get('email')), password = String(data.get('password'))
    try {
      if (action === 'reset') { await sendPasswordResetEmail(auth,email); setNotice('Password reset requested. Check your inbox.') }
      else if (action === 'signup') await createUserWithEmailAndPassword(auth,email,password)
      else await signInWithEmailAndPassword(auth,email,password)
    } catch(e) { setNotice(errorText(e)) } finally { setBusy(false) }
  }
  async function createBusiness(form: HTMLFormElement) {
    if (!user) return
    setBusy(true); setNotice('')
    const data = new FormData(form), id = crypto.randomUUID()
    const entry: Business = { id, ownerId:user.uid, name:String(data.get('name')).trim(), address:String(data.get('address')).split('\n').map(s => s.trim()).filter(Boolean), phone:String(data.get('phone')).trim(), website:String(data.get('website')).trim(), currency:String(data.get('currency')).trim().toUpperCase(), timeZone:String(data.get('timeZone')).trim() }
    try {
      new Intl.NumberFormat('en',{style:'currency',currency:entry.currency}); new Intl.DateTimeFormat('en',{timeZone:entry.timeZone})
      if(!entry.name) throw new Error('Enter a business name.')
      await setDoc(doc(db,'businesses',id),{...entry,createdAt:serverTimestamp()})
      setBusinesses(prev => [...prev,entry]); setBusinessId(id); setDraft(''); setLastLink(''); form.reset(); setView('business'); setNotice('Business created.')
    } catch(e) { setNotice(errorText(e)) } finally { setBusy(false) }
  }
  async function upload(file?: File) {
    if (!file || !business) return
    setBusy(true); setNotice(''); setDraft(''); setReviewed(false); setLastLink('')
    try {
      if (file.size > 256000) throw new Error('Use a receipt smaller than 256 KB.')
      let receipt: Receipt, nextWarnings: string[] = []
      if (file.name.toLowerCase().endsWith('.json')) receipt = validateReceipt(JSON.parse(await file.text()))
      else {
        const source = printerText(new Uint8Array(await file.arrayBuffer()))
        if (!source) throw new Error('This file contains no receipt text.')
        const result = parseText(source,merchant(),{currency:business.currency,timeZone:business.timeZone}); receipt = {...result.receipt,currency:business.currency,timeZone:business.timeZone}; nextWarnings = result.warnings
      }
      receipt.merchant = merchant(); setDraft(JSON.stringify(receipt,null,2)); setWarnings(nextWarnings)
    } catch(e) { setNotice(errorText(e)) } finally { setBusy(false) }
  }
  async function save() {
    if (!user || !business || !reviewed) return
    setBusy(true); setNotice('')
    try {
      const receipt = parseDraft()
      if (receipt.total === undefined || !receipt.items?.length) throw new Error('Add the purchase items and total before saving.')
      const id = crypto.randomUUID()
      const document = { ownerId:user.uid,businessId:business.id,receipt:storedReceipt(receipt),published:true,createdAt:serverTimestamp() }
      if(new TextEncoder().encode(JSON.stringify(document)).length > 700000) throw new Error('Receipt is too large to store.')
      await setDoc(doc(db,'receipts',id),document)
      setReceipts(prev => [{id,businessId:business.id,receipt},...prev]); setLastLink(receiptLink(id)); setNotice('Receipt saved. Its unique link is ready.'); setDraft(''); setReviewed(false); setView('business')
    } catch(e) { setNotice(errorText(e)) } finally { setBusy(false) }
  }
  function navigate(next: typeof view, id = businessId) {
    if (busy) return
    setView(next); setBusinessId(id); setDraft(''); setWarnings([]); setLastLink(''); setReviewed(false); setNotice('')
    window.scrollTo({ top: 0 })
  }
  function useSample() {
    if (!business) return
    const receipt: Receipt = { ...samples[0].receipt, id: `TEST-${crypto.randomUUID().slice(0,8)}`, issuedAt: new Date().toISOString(), merchant: merchant(), currency: business.currency, timeZone: business.timeZone,
      original: { ...samples[0].receipt.original, text: samples[0].receipt.original.text?.replace('PIZZA COMPANY',business.name.toUpperCase()) } }
    setDraft(JSON.stringify(receipt,null,2)); setWarnings([]); setReviewed(false); setNotice('')
  }
  const businessReceipts = receipts.filter(r => r.businessId === businessId)
  const businessForm = <form className="business-form" onSubmit={e=>{e.preventDefault();void createBusiness(e.currentTarget)}}>
    <label>Business name<input name="name" required maxLength={160} placeholder="e.g. Mad Mushroom"/></label>
    <label>Address<textarea name="address" rows={2} maxLength={1000}/></label>
    <div className="form-pair"><label>Phone<input name="phone" type="tel" maxLength={80}/></label><label>Website<input name="website" placeholder="yourbusiness.com" maxLength={200}/></label></div>
    <div className="form-pair"><label>Currency<input name="currency" defaultValue="USD" required pattern="[A-Za-z]{3}" maxLength={3}/></label><label>Time zone<input name="timeZone" defaultValue="America/Indiana/Indianapolis" required/></label></div>
    <div className="buttons"><button className="primary" disabled={busy}>Create business</button><button type="button" disabled={busy} onClick={()=>navigate('businesses','')}>Cancel</button></div>
  </form>
  const savedList = <section className="receipt-list" aria-label="Saved receipts">
    {businessReceipts.length ? <><div className="list-labels"><span>Receipt</span><span>Total</span><span>Link</span></div><ul>{businessReceipts.map(r=><li key={r.id}><div><strong>{r.receipt.id}</strong><span>{new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeZone:r.receipt.timeZone}).format(new Date(r.receipt.issuedAt))}</span></div><span>{r.receipt.total !== undefined ? money(r.receipt,Math.abs(r.receipt.total)) : '—'}</span><a href={receiptLink(r.id)} target="_blank" rel="noreferrer">Open receipt ↗</a></li>)}</ul></> : <div className="empty-state"><h2>No receipts yet.</h2><p>Create a test receipt for {business?.name} to get its first shareable link.</p><button className="primary" onClick={()=>navigate('receipt')}>Create test receipt</button></div>}
  </section>
  return <main className="dashboard"><header><a href="/" className="brand"><img src="/brand/cindertap-mark.svg" alt="" width="30" height="30"/>CinderTap</a><span>Receipt dashboard</span>{user && <button disabled={busy} onClick={()=>{void signOut(auth).catch(e=>setNotice(errorText(e)))}}>Sign out</button>}</header>
    <div role="status" aria-live="polite" className="notice">{notice}</div>
    {!ready ? <p>Loading your dashboard…</p> : !user ? <section className="signin"><p className="kicker">BUSINESSES & RECEIPTS</p><h1>Your receipts, in one place.</h1><p>Sign in to manage businesses and upload test receipts.</p><form onSubmit={e=>{e.preventDefault();void account(e.currentTarget,'signin')}}><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" minLength={8} required autoComplete="current-password"/></label><div className="buttons"><button className="primary" disabled={busy}>Sign in</button><button type="button" disabled={busy} onClick={e=>{const form=e.currentTarget.form!;if(form.reportValidity()) void account(form,'signup')}}>Create account</button></div><button type="button" disabled={busy} onClick={e=>{const form=e.currentTarget.form!;const email=form.elements.namedItem('email') as HTMLInputElement;if(email.reportValidity()) void account(form,'reset')}}>Forgot password?</button></form></section> : <>
      <nav className="breadcrumbs" aria-label="Dashboard navigation"><button disabled={busy || view === 'businesses'} onClick={()=>navigate('businesses','')}>Businesses</button>{view === 'business-form' ? <><span>/</span><span>New business</span></> : business && <><span>/</span><button disabled={busy || view === 'business'} onClick={()=>navigate('business')}>{business.name}</button>{view === 'receipt' && <><span>/</span><span>New receipt</span></>}</>}</nav>
      {loading ? <p className="loading-state">Loading your businesses…</p> : view === 'businesses' ? <>
        <section className="page-heading"><div><h1>Businesses</h1><p>Select a business to manage its test receipts.</p></div><button className="primary" onClick={()=>navigate('business-form','')}>+ Add business</button></section>
        {businesses.length ? <section aria-label="Your businesses" className="business-list"><div className="business-list-labels"><span>Business</span><span>Receipts</span></div><ul>{businesses.map(b=>{const count=receipts.filter(r=>r.businessId===b.id).length;return <li key={b.id}><button className="business-row" onClick={()=>navigate('business',b.id)}><span className="business-initial" aria-hidden="true">{b.name.slice(0,1).toUpperCase()}</span><span className="business-identity"><strong>{b.name}</strong><span>{b.address?.filter(Boolean).join(' · ') || 'No address added'}</span></span><span className="business-count">{count} <span>{count === 1 ? 'receipt' : 'receipts'}</span></span><span className="row-arrow" aria-hidden="true">→</span></button></li>})}</ul></section> : <section className="empty-state"><h2>Your first business starts here.</h2><p>Add a restaurant or business, then create test receipts for it.</p><button className="primary" onClick={()=>navigate('business-form','')}>Add your first business</button></section>}
      </> : view === 'business-form' ? <><section className="page-heading"><div><h1>Add a business</h1><p>These details appear on its receipts.</p></div></section>{businessForm}</> : business ? view === 'business' ? <>
        <section className="page-heading"><div><h1>{business.name}</h1><p>{business.address?.join(' · ') || 'Business receipts'}</p><span className="business-meta">{business.currency} · {businessReceipts.length} {businessReceipts.length === 1 ? 'receipt' : 'receipts'}</span></div>{businessReceipts.length > 0 && <button className="primary" onClick={()=>navigate('receipt')}>+ Create test receipt</button>}</section>
        {lastLink && <section className="link-result"><h2>Receipt created</h2><p>Share this link to open the receipt on any device.</p><a href={lastLink} target="_blank" rel="noreferrer">{lastLink}</a><button onClick={()=>{void navigator.clipboard.writeText(lastLink).then(()=>setNotice('Receipt link copied.')).catch(()=>setNotice('Select the link to copy it manually.'))}}>Copy link</button></section>}
        <div className="section-heading"><h2>Receipts</h2><a href="/test-receipts/" target="_blank" rel="noreferrer">Get test files ↗</a></div>{savedList}
      </> : <>
        <section className="page-heading"><div><h1>Create test receipt</h1><p>For <strong>{business.name}</strong></p></div><button disabled={busy} onClick={()=>navigate('business')}>Cancel</button></section>
        <section className="receipt-creator" aria-label="Create test receipt"><div className="upload-start"><h2>Start with a receipt</h2><p>Upload a file or use a sample to try the complete flow.</p><fieldset disabled={busy}><label className="file-label"><span>Upload receipt file</span><small>ESC/POS (.bin, .prn), text, or JSON · up to 256 KB</small><input type="file" accept=".json,.txt,.bin,.prn" onChange={e=>{void upload(e.target.files?.[0]);e.target.value=''}}/></label><div className="upload-alternatives"><button onClick={useSample}>Use sample receipt</button><a href="/test-receipts/" target="_blank" rel="noreferrer">Download test files ↗</a></div></fieldset></div>
        {warnings.length>0 && draft && <ul className="warnings">{warnings.map(w=><li key={w}>{w}</li>)}</ul>}
        {draft && <section className="review"><h2>Review receipt</h2>{parsed && <div className="receipt-preview"><div className="preview-header"><strong>{parsed.id}</strong><span>{parsed.currency}</span></div>{parsed.items?.map((item,i)=><div className="preview-item" key={i}><span>{Math.abs(item.quantity)} × {item.name}</span><span>{money(parsed,Math.abs(item.total))}</span></div>)}{parsed.subtotal !== undefined && <div className="preview-line"><span>Subtotal</span><span>{money(parsed,parsed.subtotal)}</span></div>}{parsed.adjustments?.map((a,i)=><div className="preview-line" key={`adjustment-${i}`}><span>{a.label}</span><span>{money(parsed,a.amount)}</span></div>)}{parsed.taxes?.map((t,i)=><div className="preview-line" key={`tax-${i}`}><span>{t.label}{t.included ? ' (included)' : ''}</span><span>{money(parsed,Math.abs(t.amount))}</span></div>)}<div className="preview-total"><strong>Total</strong><strong>{parsed.total !== undefined ? money(parsed,Math.abs(parsed.total)) : 'Not found'}</strong></div></div>}
          <details className="edit-data"><summary>Edit receipt data</summary><p>Amounts use minor units: 1200 means $12.00 in USD. Merchant details come from this business.</p><label>Receipt data<textarea className="json-editor" value={draft} spellCheck={false} onChange={e=>{setDraft(e.target.value);setReviewed(false)}} disabled={busy}/></label></details>
          {validation && <p role="alert" className="validation">{validation}</p>}
          {parsed?.original.text && <details><summary>View original receipt</summary><pre className="original-text">{parsed.original.text}</pre></details>}
          <label className="checkbox"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} disabled={busy}/>I checked this receipt against the original. Anyone with its link can view it.</label><div className="buttons"><button className="primary" disabled={busy || !reviewed || !!validation} onClick={()=>void save()}>{busy ? 'Saving…' : 'Create receipt & link'}</button><button disabled={busy} onClick={()=>{setDraft('');setReviewed(false);setWarnings([])}}>Discard draft</button></div>
        </section>}</section>
      </> : <section className="empty-state"><h1>Business unavailable</h1><button onClick={()=>navigate('businesses','')}>Back to businesses</button></section>}
      </>}

  </main>
}
createRoot(document.getElementById('root')!).render(<StrictMode><Dashboard/></StrictMode>)
