// Merchant actions stay outside the receipt and its downloadable proof of purchase.
const select = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!
function notify(message: string) {
  const status = select('#status')
  status.textContent = message; status.classList.add('visible')
  setTimeout(() => status.classList.remove('visible'), 4000)
}
document.addEventListener('click', event => {
  const trigger = (event.target as Element).closest<HTMLButtonElement>('[data-open]')
  if (trigger) select<HTMLDialogElement>(`#${trigger.dataset.open}`).showModal()
})
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()))
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })
})
let couponTimer: ReturnType<typeof setTimeout>
select('#copy-coupon').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('PIZZA10')
    clearTimeout(couponTimer)
    const button = select('#copy-coupon')
    button.classList.add('copied'); button.setAttribute('aria-label', 'Copied!'); button.setAttribute('title', 'Copied!')
    select('#coupon-copy-status').textContent = 'PIZZA10 copied to your clipboard.'
    couponTimer = setTimeout(() => {
      button.classList.remove('copied'); button.setAttribute('aria-label', 'Copy coupon code'); button.setAttribute('title', 'Copy coupon code')
      select('#coupon-copy-status').textContent = ''
    }, 2500)
  } catch { notify('Press and hold PIZZA10 to copy it.') }
})
const apps: Record<string, string> = { quickbooks: 'QuickBooks', expensify: 'Expensify', dext: 'Dext', hubdoc: 'Hubdoc', xero: 'Xero' }
let exportFormat = 'image'
document.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(button => button.addEventListener('click', () => {
  const kind = button.dataset.export!
  exportFormat = kind === 'quickbooks' ? 'csv' : 'image'
  select('#export-title').textContent = `Export for ${apps[kind]}`
  select('#export-description').textContent = kind === 'quickbooks'
    ? 'Download a transaction CSV with date, merchant, currency, amount, and status. Map the columns when importing into your accounting app.'
    : `Download a receipt image, then upload or attach it to your expense in ${apps[kind]}.`
  select('#confirm-export').textContent = kind === 'quickbooks' ? 'Download transaction CSV' : 'Download receipt image'
  select<HTMLDialogElement>('#export-dialog').showModal()
}))
select('#confirm-export').addEventListener('click', () => {
  select<HTMLDialogElement>('#export-dialog').close()
  select<HTMLButtonElement>(`[data-format="${exportFormat}"]`).click()
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
