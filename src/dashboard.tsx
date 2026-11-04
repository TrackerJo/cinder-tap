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
  const [businesses, setBusinesses] = useState<Business[]>([]), [receipts, setReceipts] = useState<Stored[]>([])
  const [businessId, setBusinessId] = useState(''), [draft, setDraft] = useState(''), [warnings, setWarnings] = useState<string[]>([])
  const [reviewed, setReviewed] = useState(false), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [lastLink, setLastLink] = useState('')
  const business = businesses.find(b => b.id === businessId)
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setReady(true); setBusinesses([]); setReceipts([]); setBusinessId(''); setDraft(''); setLastLink('') }), [])
  useEffect(() => {
    if (!user) return
    let active = true
    void Promise.all([getDocs(query(collection(db,'businesses'),where('ownerId','==',user.uid))), getDocs(query(collection(db,'receipts'),where('ownerId','==',user.uid)))]).then(([b,r]) => {
      if (!active) return
      const next = b.docs.map(d => ({...d.data(), id:d.id}) as Business)
      setBusinesses(next); setBusinessId(next[0]?.id ?? '')
      setReceipts(r.docs.map(d => ({...d.data(), id:d.id}) as Stored).sort((a,b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)))
    }).catch(e => { if(active) setNotice(errorText(e)) })
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
      setBusinesses(prev => [...prev,entry]); setBusinessId(id); setDraft(''); setLastLink(''); form.reset(); setNotice('Business created. You can upload a receipt now.')
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
      setReceipts(prev => [{id,businessId:business.id,receipt},...prev]); setLastLink(receiptLink(id)); setNotice('Receipt saved. Its unique link is ready.'); setDraft(''); setReviewed(false)
    } catch(e) { setNotice(errorText(e)) } finally { setBusy(false) }
  }
  function example() {
    const receipt = {...samples[0].receipt,merchant:merchant(),currency:business!.currency,timeZone:business!.timeZone}
    const url = URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}))
    const a = document.createElement('a'); a.href=url;a.download='test-receipt.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)
  }
  return <main className="dashboard"><header><a href="/" className="brand"><img src="/brand/cindertap-mark.svg" alt="" width="30" height="30"/>CinderTap</a><span>Receipt dashboard</span>{user && <button disabled={busy} onClick={()=>{void signOut(auth).catch(e=>setNotice(errorText(e)))}}>Sign out</button>}</header>
    <div role="status" aria-live="polite" className="notice">{notice}</div>
    {!ready ? <p>Loading your dashboard…</p> : !user ? <section className="signin"><p className="kicker">BUSINESSES & RECEIPTS</p><h1>Your receipts, in one place.</h1><p>Sign in to manage businesses and upload test receipts.</p><form onSubmit={e=>{e.preventDefault();void account(e.currentTarget,'signin')}}><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" minLength={8} required autoComplete="current-password"/></label><div className="buttons"><button className="primary" disabled={busy}>Sign in</button><button type="button" disabled={busy} onClick={e=>{const form=e.currentTarget.form!;if(form.reportValidity()) void account(form,'signup')}}>Create account</button></div><button type="button" disabled={busy} onClick={e=>{const form=e.currentTarget.form!;const email=form.elements.namedItem('email') as HTMLInputElement;if(email.reportValidity()) void account(form,'reset')}}>Forgot password?</button></form></section> : <>
      <section className="intro"><p className="kicker">YOUR WORKSPACE</p><h1>From upload to receipt.</h1><p>Create a business, review a receipt, and share its unique link.</p></section>
      <div className="workspace"><aside><h2>Businesses</h2>{businesses.length ? <label>Selected business<select value={businessId} disabled={busy} onChange={e=>{setBusinessId(e.target.value);setDraft('');setLastLink('');setReviewed(false)}}>{businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label> : <p>Create your first business to get started.</p>}
      <details open={!businesses.length}><summary>Create a business</summary><form onSubmit={e=>{e.preventDefault();void createBusiness(e.currentTarget)}}><label>Business name<input name="name" required maxLength={160}/></label><label>Address<textarea name="address" rows={2} maxLength={1000}/></label><label>Phone<input name="phone" type="tel" maxLength={80}/></label><label>Website<input name="website" placeholder="yourbusiness.com" maxLength={200}/></label><label>Currency<input name="currency" defaultValue="USD" required pattern="[A-Za-z]{3}" maxLength={3}/></label><label>Time zone<input name="timeZone" defaultValue="America/Indiana/Indianapolis" required/></label><button className="primary" disabled={busy}>Create business</button></form></details></aside>
      <section className="upload-section"><h2>{business ? `Receipts for ${business.name}` : 'Upload a receipt'}</h2><p>Upload parsed JSON, plain text, or a supported ESC/POS .bin/.prn file. Review the result before publishing.</p><fieldset disabled={busy || !business}><label className="file-label">Choose a receipt file<input type="file" accept=".json,.txt,.bin,.prn" onChange={e=>{void upload(e.target.files?.[0]);e.target.value=''}}/></label><button onClick={example}>Download example JSON</button> <a className="test-files" href="/test-receipts/" target="_blank" rel="noreferrer">Get test .bin receipts ↗</a></fieldset>
      {warnings.length>0 && draft && <ul className="warnings">{warnings.map(w=><li key={w}>{w}</li>)}</ul>}
      {draft && <div className="review"><h3>Review parsed receipt</h3><p>Amounts are in minor units: 1200 means $12.00 for USD. The selected business supplies the merchant details.</p><label>Receipt data<textarea className="json-editor" value={draft} spellCheck={false} onChange={e=>{setDraft(e.target.value);setReviewed(false)}} disabled={busy}/></label>{validation && <p role="alert" className="validation">{validation}</p>}{parsed && <div className="parsed-summary"><strong>{parsed.id}</strong><span>{parsed.items?.length ?? 0} items</span><span>Total {parsed.total !== undefined ? money(parsed,parsed.total) : 'not found'}</span></div>}<label className="checkbox"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)} disabled={busy}/>I checked this receipt against the original. Anyone with its link can view it.</label><button className="primary" disabled={busy || !reviewed || !!validation} onClick={()=>void save()}>{busy ? 'Saving…' : 'Save & create receipt link'}</button></div>}
      {lastLink && <div className="link-result"><h3>Your receipt link</h3><a href={lastLink} target="_blank" rel="noreferrer">{lastLink}</a><button onClick={()=>{void navigator.clipboard.writeText(lastLink).then(()=>setNotice('Receipt link copied.')).catch(()=>setNotice('Select the link to copy it manually.'))}}>Copy link</button></div>}
      <section className="history"><h3>Saved receipts</h3>{receipts.filter(r=>r.businessId===businessId).length ? <ul>{receipts.filter(r=>r.businessId===businessId).map(r=><li key={r.id}><div><strong>{r.receipt.id}</strong><span>{r.receipt.total !== undefined ? money(r.receipt,r.receipt.total) : ''}</span></div><a href={receiptLink(r.id)} target="_blank" rel="noreferrer">Open receipt ↗</a></li>)}</ul> : <p>No receipts yet for this business.</p>}</section>
      </section></div></>}
  </main>
}
createRoot(document.getElementById('root')!).render(<StrictMode><Dashboard/></StrictMode>)
