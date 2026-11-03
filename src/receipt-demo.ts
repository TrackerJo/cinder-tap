import './typography'
// This page is a standalone entry: no React or landing-page animation bundle.
const select = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!
const toast = select('#toast')
let toastTimer: ReturnType<typeof setTimeout>
function notify(message: string) {
  toast.textContent = message
  toast.classList.add('visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500)
}
document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(button => {
  button.addEventListener('click', () => select<HTMLDialogElement>(`#${button.dataset.open}`).showModal())
})
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()))
  dialog.addEventListener('click', event => { if(event.target === dialog) dialog.close() })
})
function downloadFile(blob: Blob, filename: string) {
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url; link.download = filename; link.click()
 setTimeout(() => URL.revokeObjectURL(url), 10000)
}
async function receiptImage() {
 await document.fonts.ready
 const bodyFont = getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim()
 const canvas = document.createElement('canvas')
 canvas.width = 1000; canvas.height = 1340
 const ctx = canvas.getContext('2d')!
 ctx.fillStyle = '#fffef9'; ctx.fillRect(0,0,1000,1340)
 ctx.fillStyle = '#ba1d24';ctx.fillRect(0,0,1000,240)
 const logo = new Image(); logo.src = '/brand/pizza-company-logo.svg'
 await logo.decode()
 ctx.drawImage(logo,140,45,720,162)
 ctx.fillStyle = '#e8a537';ctx.fillRect(0,240,1000,10)
 function line(left: string, right: string, y: number, size=28, color='#292823') {
  ctx.fillStyle=color; ctx.font=`${size}px ${bodyFont}`;ctx.textAlign='left';ctx.fillText(left,70,y);ctx.textAlign='right';ctx.fillText(right,930,y)
 }
 line('Your receipt','#CT-1042',335,34,'#ba1d24')
 line('Nov 2, 2026 · 6:42 PM','',395,24,'#777164')
 ctx.strokeStyle='#dedbcf';ctx.beginPath();ctx.moveTo(70,440);ctx.lineTo(930,440);ctx.stroke()
 line('1  Cheese pizza','$14.00',520)
 line('    14 inch · Original crust','',560,22,'#777164')
 line('1  Cheesestix','$8.00',635)
 line('    With marinara','',675,22,'#777164')
 line('2  Fountain drinks','$5.00',750)
 line('    $2.50 each','',790,22,'#777164')
 ctx.beginPath();ctx.moveTo(70,840);ctx.lineTo(930,840);ctx.stroke()
 line('Subtotal','$27.00',905,26)
 line('Tax (7%)','$1.89',960,26)
 line('Total paid','$28.89',1050,42,'#ba1d24')
 line('Visa ending in 4242','Paid in full',1140,24,'#777164')
 const platformMark = new Image(); platformMark.src = '/brand/cindertap-mark.svg'
 await platformMark.decode()
 ctx.drawImage(platformMark,350,1225,40,40)
 ctx.textAlign='left';ctx.fillStyle='#2A1A10';ctx.font=`22px ${bodyFont}`;ctx.fillText('Powered by CinderTap',400,1252)
 return canvas
}
let selectedExport = ''
const exportDescriptions: Record<string,string> = {
 quickbooks:'Download a transaction CSV with the date, merchant, and amount. Import it into your selected QuickBooks bank or credit card account.',
 dext:'Download a receipt image, then upload it to Dext to capture the expense.',
 hubdoc:'Download a receipt image, then upload it to your Hubdoc document inbox.',
 xero:'Download a receipt image, then attach it to the matching expense or transaction in Xero.',
 expensify:'Download a receipt image, then upload it to Expensify to attach it to an expense.'
}
async function exportReceipt(kind: string) {
 const button = select<HTMLButtonElement>(kind in exportDescriptions ? '#confirm-export' : `[data-export="${kind}"]`)
 button.disabled = true; button.setAttribute('aria-busy','true')
 try {
  if(kind === 'quickbooks') {
   const csv = 'Date,Description,Amount\r\n11/02/2026,Pizza Company CT-1042,-28.89\r\n'
   downloadFile(new Blob([csv],{type:'text/csv;charset=utf-8'}),`pizza-company-${kind}.csv`)
  } else {
   const canvas = await receiptImage()
   if(kind === 'pdf') {
    const {jsPDF} = await import('jspdf')
    const doc = new jsPDF({unit:'px',format:[500,670],hotfixes:['px_scaling']})
    doc.addImage(canvas.toDataURL('image/png'),'PNG',0,0,500,670)
    doc.save('pizza-company-receipt.pdf')
   } else {
    const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Image export failed')),'image/png'))
    downloadFile(blob,'pizza-company-receipt.png')
   }
  }
  select<HTMLDialogElement>('#export-dialog').close()
  notify('Your receipt is ready to download.')
 } catch { notify('Could not create the file. Please try again.') }
 finally {button.disabled=false;button.removeAttribute('aria-busy')}
}
document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(button => button.addEventListener('click',() => {
 const kind = button.dataset.export!
 if(kind in exportDescriptions) {
  selectedExport=kind
  select('#export-title').textContent = `Export for ${({quickbooks:'QuickBooks',expensify:'Expensify',dext:'Dext',hubdoc:'Hubdoc',xero:'Xero'} as Record<string,string>)[kind]}`
  select('#export-description').textContent = exportDescriptions[kind]
  select('#confirm-export').textContent = kind === 'quickbooks' ? 'Download transaction CSV' : 'Download receipt image'
  select<HTMLDialogElement>('#export-dialog').showModal()
 } else void exportReceipt(kind)
}))
select('#confirm-export').addEventListener('click',() => {void exportReceipt(selectedExport)})
let couponCopyTimer: ReturnType<typeof setTimeout>
select('#copy-coupon').addEventListener('click', async () => {
 try {
  await navigator.clipboard.writeText('PIZZA10')
  clearTimeout(couponCopyTimer)
  select('#copy-coupon').setAttribute('aria-label', 'Copied!')
  select('#copy-coupon').setAttribute('title', 'Copied!')
  select('#coupon-copy-status').textContent = 'PIZZA10 copied to your clipboard.'
  select('#copy-coupon').classList.add('copied')
  couponCopyTimer = setTimeout(() => {
   select('#copy-coupon').setAttribute('aria-label', 'Copy coupon code')
   select('#copy-coupon').classList.remove('copied')
   select('#copy-coupon').setAttribute('title', 'Copy coupon code')
   select('#coupon-copy-status').textContent = ''
  }, 2500)
 } catch {
  notify('Press and hold PIZZA10 to copy it.')
 }
})
// Load motion only when the rewards card is approached. Content never waits for it.
const motionTarget = select('.reward-card')
if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if(!entries.some(entry => entry.isIntersecting)) return
    observer.disconnect()
    void Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}]) => {
      gsap.registerPlugin(ScrollTrigger)
      gsap.fromTo('.reward-heading>svg',{scale:.8},{scale:1,duration:.65,ease:'power2.out'})
      gsap.to('.reward-heading>svg',{opacity:.2,scrollTrigger:{trigger:'.reward-card',start:'bottom 30%',end:'bottom top',scrub:true}})
      if(window.innerWidth > 760) ScrollTrigger.create({trigger:'.reward-card',start:'top 20px',endTrigger:'.goodbye',end:'top 300px',pin:true,pinSpacing:false})
    }).catch(() => { /* Decorative motion is optional; all actions work without it. */ })
  },{rootMargin:'0px'})
  observer.observe(motionTarget)
}
export {}
