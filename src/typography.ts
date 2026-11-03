import './typography.css'

const storageKey = 'cindertap-font-pairing'
const pairings = [
  ['bricolage', 'Bricolage Grotesque + DM Sans'],
  ['cabinet', 'Cabinet Grotesk + Satoshi'],
  ['fraunces', 'Fraunces + Work Sans'],
] as const

function applyPairing(value: string | null) {
  const pairing = pairings.some(([id]) => id === value) ? value! : 'bricolage'
  document.documentElement.dataset.fontPairing = pairing
  return pairing
}

let savedPairing: string | null = null
try { savedPairing = localStorage.getItem(storageKey) } catch { /* Preview works without storage. */ }
applyPairing(savedPairing)

const switcher = document.createElement('aside')
switcher.className = 'font-switcher'
switcher.setAttribute('aria-label', 'Typography preview')
const label = document.createElement('label')
label.htmlFor = 'font-pairing'
label.textContent = 'Font pairing'
const select = document.createElement('select')
select.id = 'font-pairing'
for (const [value, name] of pairings) {
  select.add(new Option(name, value))
}
select.value = document.documentElement.dataset.fontPairing!
select.addEventListener('change', () => {
  applyPairing(select.value)
  try { localStorage.setItem(storageKey, select.value) } catch { /* Keep the current preview. */ }
  // Refresh animation measurements after the new fonts settle.
  void document.fonts.ready.then(() => window.dispatchEvent(new Event('resize')))
})
window.addEventListener('storage', event => {
  if (event.key === storageKey || event.key === null) select.value = applyPairing(event.newValue)
})
switcher.append(label, select)
document.body.append(switcher)
