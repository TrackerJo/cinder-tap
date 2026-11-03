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
  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', event => { if(event.target === dialog) dialog.close() })
})
select('#save-receipt').addEventListener('click', () => {
  const text = 'MAD MUSHROOM — SAMPLE RECEIPT\nNot an official receipt. No payment processed.\n\nNov 2, 2026 · 6:42 PM\nOrder #CT-1042\n\n1 Cheese pizza (14 inch)        $14.00\n1 Cheesestix                     $8.00\n2 Fountain drinks                $5.00\n\nSubtotal                        $27.00\nSample tax (7%)                   $1.89\nTotal paid                      $28.89\n\nSample Visa ending 4242\n\nPowered by CinderTap\n'
  const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}))
  const link = document.createElement('a')
  link.href = url
  link.download = 'mad-mushroom-sample-receipt.txt'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  notify('Your sample receipt is ready to save.')
})
let joined = false
try { joined = localStorage.getItem('cindertap-mm-demo-rewards') === 'joined' } catch { /* Storage can be unavailable in private browsing. */ }
function showMembership() {
  select('#reward-action').textContent = 'View your demo rewards'
  select('#join-rewards').innerHTML = 'Your demo card is active <svg><use href="#check"/></svg>'
  select<HTMLButtonElement>('#join-rewards').disabled = true
  select('#rewards-dialog-title').innerHTML = 'You’re on<br>the demo list.'
}
if(joined) showMembership()
select('#join-rewards').addEventListener('click', () => {
  try { localStorage.setItem('cindertap-mm-demo-rewards','joined') } catch { /* Keep the experience usable without storage. */ }
  showMembership()
  notify('Demo rewards activated. No real enrollment.')
})
const form = select<HTMLFormElement>('#review-form')
form.addEventListener('change', () => {
  const rating = Number(new FormData(form).get('rating'))
  form.querySelectorAll('label').forEach((label,index) => label.classList.toggle('selected', index < rating))
})
form.addEventListener('submit', event => {
  event.preventDefault()
  const rating = Number(new FormData(form).get('rating'))
  select('#preview-stars').textContent = `${rating} / 5 stars`
  select('#preview-message').textContent = select<HTMLTextAreaElement>('#review-message').value.trim() || 'No written review added.'
  form.hidden = true
  select<HTMLElement>('#review-preview').hidden = false
})
select('#edit-review').addEventListener('click', () => {
  form.hidden = false
  select<HTMLElement>('#review-preview').hidden = true
  select<HTMLTextAreaElement>('#review-message').focus()
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
