import './typography.css'
import './receipt-demo.css'
import './receipt-template.css'
import './receipt-engagement'
import { samples } from './receipt-samples'
import { dateLabel, money } from './receipt-model'
import { reviewUrl } from './review-links'
import type { Receipt } from './receipt-model'
const root = document.querySelector<HTMLDivElement>('#receipt')!
const status = document.querySelector<HTMLElement>('#status')!
const requestedType = new URLSearchParams(window.location.search).get('type')?.trim().toLowerCase()
const receiptId = new URLSearchParams(window.location.search).get('receipt')
let current: Receipt | undefined = receiptId ? undefined : (samples.find(sample => sample.type === requestedType) ?? samples[0]).receipt
const escape = (value: string | number) => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const row = (label: string, value: string, className = '') => `<div class="receipt-row ${className}"><span>${escape(label)}</span><span>${escape(value)}</span></div>`
// Only trusted local / HTTPS media is allowed, never arbitrary URL schemes.
const media = (url: string) => url.startsWith('/') && !url.startsWith('//') || url.startsWith('https://') ? escape(url) : ''
function render(r: Receipt) {
  const amount = (n: number) => money(r, r.kind === 'Refund' ? Math.abs(n) : n)
  const quantity = (n: number) => r.kind === 'Refund' ? Math.abs(n) : n
  const paidLabel = r.kind === 'Refund' ? 'Amount refunded' : 'Amount paid'
  root.innerHTML = `<section class="merchant template-merchant">${r.merchant.logo ? `<img src="${media(r.merchant.logo)}" alt="${escape(r.merchant.name)}">` : `<h1>${escape(r.merchant.name)}</h1>`}<div class="merchant-info">${r.merchant.branch ? `<p class="merchant-branch">${escape(r.merchant.branch)}</p>` : ''}${r.merchant.address?.length ? `<p class="merchant-address">${r.merchant.address.map(line => `<span>${escape(line)}</span>`).join(' · ')}</p>` : ''}${r.merchant.phone || r.merchant.website ? `<p class="merchant-contact">${[r.merchant.phone, r.merchant.website].filter(Boolean).map(line => `<span>${escape(line!)}</span>`).join(' · ')}</p>` : ''}${r.merchant.registration ? `<p class="merchant-registration">${escape(r.merchant.registration)}</p>` : ''}</div></section>
  <nav id="business-reviews" aria-label="Review this business" hidden></nav>
  ${!receiptId && r.merchant.name === 'Pizza Company' ? '<nav class="quick-actions" aria-label="Quick actions"><button data-open="review-dialog"><span class="shortcut-icon"><svg class="google-logo" aria-hidden="true"><use href="#google-logo"/></svg></span><span>Google review</span><svg class="shortcut-arrow" aria-hidden="true"><use href="#arrow"/></svg></button><button data-open="rewards-dialog"><span class="shortcut-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v4a3 3 0 0 0 0 6v4H4v-4a3 3 0 0 0 0-6V5Z"/><path d="M15 5v2m0 3v1m0 3v1m0 2v2"/></svg></span><span>Pizza coupon</span><svg class="shortcut-arrow" aria-hidden="true"><use href="#arrow"/></svg></button></nav>' : ''}<article class="receipt-paper template-paper" aria-labelledby="receipt-title"><header class="receipt-title"><div><h2 id="receipt-title">${r.kind === 'Refund' ? 'Your refund' : 'Your receipt'}</h2><p>${escape(dateLabel(r))}</p><p class="timezone">${escape(r.timeZone)}</p></div><div class="receipt-reference"><p>#${escape(r.id)}</p>${r.orderNumber ? `<p>Order ${escape(r.orderNumber)}</p>` : ''}</div></header>
  ${r.context?.length ? `<section class="context">${r.context.map(([key, value]) => row(key, value)).join('')}</section>` : ''}
  ${r.items?.length ? `<section class="receipt-items" aria-label="Purchased items">${r.items.map(item => `<div class="receipt-item"><div><h3>${!item.unit && quantity(item.quantity) !== 1 ? `${escape(quantity(item.quantity))} × ` : ''}${escape(item.name)}</h3>${item.unit ? `<p>${escape(quantity(item.quantity))} ${escape(item.unit)} at ${escape(amount(item.unitPrice))}/${escape(item.unit)}</p>` : quantity(item.quantity) !== 1 ? `<p>${escape(amount(item.unitPrice))} each</p>` : item.total !== item.unitPrice && !item.adjustments?.length ? `<p>Base price ${escape(amount(item.unitPrice))}</p>` : ''}${item.variants?.length ? `<p>${item.variants.map(escape).join(' · ')}</p>` : ''}${(item.modifiers ?? []).map(line => `<p>${escape(line)}</p>`).join('')}${(item.notes ?? []).map(line => `<p class="item-note">${escape(line)}</p>`).join('')}${item.sku ? `<p class="item-sku">SKU ${escape(item.sku)}</p>` : ''}${(item.adjustments ?? []).map(a => `<p>${escape(a.label)} ${escape(amount(a.amount))}</p>`).join('')}</div><strong>${escape(amount(item.total))}</strong></div>`).join('')}</section>` : ''}
  ${r.total !== undefined ? `<section class="receipt-totals" aria-label="Receipt totals">${r.subtotal !== undefined ? row('Subtotal', amount(r.subtotal)) : ''}${(r.adjustments ?? []).map(a => row(a.label, amount(a.amount))).join('')}${(r.taxes ?? []).map(t => row(`${t.label}${t.rate ? ` (${t.rate})` : ''}${t.included ? ' · included' : ''}`, amount(t.amount))).join('')}${row(r.kind === 'Refund' ? 'Refund total' : 'Total', amount(r.total), 'grand-total')}${r.tip !== undefined ? row('Tip', amount(r.tip)) : ''}${r.paid !== undefined ? row(paidLabel, amount(r.kind === 'Refund' ? Math.abs(r.paid) : r.paid)) : ''}${r.balance !== undefined && r.balance !== 0 ? row('Balance due', amount(r.balance), 'balance-due') : ''}</section>` : `<p class="image-notice">This receipt was supplied as an image. See the original below for the complete purchase details.</p>`}
  ${r.payments?.length ? `<details class="receipt-details"><summary>Payment details</summary>${r.payments.map(p => `<div class="payment">${row(`${p.method}${p.last4 ? ` ending in ${p.last4}` : ''}`, amount(p.amount))}${p.tendered !== undefined ? row('Tendered', amount(p.tendered)) : ''}${p.change !== undefined ? row('Change', amount(p.change)) : ''}${p.reference ? `<p>${escape(p.reference)}</p>` : ''}</div>`).join('')}</details>` : ''}
  ${r.details?.length ? `<details class="receipt-details"><summary>Transaction details</summary>${r.details.map(([key, value]) => row(key, value)).join('')}</details>` : ''}
  ${(r.messages ?? []).map(m => `<section class="receipt-message"><h3>${escape(m.title)}</h3><p>${escape(m.text)}</p></section>`).join('')}
  ${(r.codes ?? []).map(c => `<section class="receipt-code"><h3>${escape(c.label)}</h3><img src="${media(c.image)}" alt="${escape(c.label)}">${c.value ? `<p>${escape(c.value)}</p>` : ''}</section>`).join('')}
  ${(r.extra ?? []).map(block => `<section class="receipt-message"><h3>${escape(block.title)}</h3>${block.lines.map(line => `<p>${escape(line)}</p>`).join('')}</section>`).join('')}
  <details class="receipt-details original" ${!r.items?.length ? 'open' : ''}><summary>View original receipt</summary>${r.original.text ? `<pre>${escape(r.original.text)}</pre>` : ''}${r.original.image ? `<img src="${media(r.original.image)}" alt="Original receipt from ${escape(r.merchant.name)}">` : ''}</details></article>`
  document.querySelector<HTMLElement>('#merchant-engagement')!.hidden = !!receiptId || r.merchant.name !== 'Pizza Company'
  document.title = `${r.merchant.name} · Receipt template`
}
function renderReviewTiles(links: Record<string, unknown>) {
  const shortcuts = document.querySelector<HTMLElement>('#business-reviews')!
  const tiles = document.querySelector<HTMLElement>('#business-review-tiles')!
  const entries = (['google','yelp'] as const).flatMap(platform => {
    const url = reviewUrl(links[platform],platform)
    if (!url) return []
    const name = platform === 'google' ? 'Google' : 'Yelp'
    const icon = platform === 'google' ? '<svg class="google-logo" aria-hidden="true"><use href="#google-logo"/></svg>' : '<img class="yelp-review-icon" src="/brand/yelp-icon.png?v=burst" alt="" width="30" height="30">'
    return [{url,name,icon}]
  })
  shortcuts.innerHTML = entries.map(({url,name,icon}) => `<a class="review-shortcut" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Review us on ${name}" title="${name} review">${icon}</a>`).join('')
  tiles.innerHTML = entries.map(({url,name,icon}) => `<a class="review-card" href="${escape(url)}" target="_blank" rel="noopener noreferrer"><span class="review-icon google-review-icon">${icon}</span><span><strong>Review us on ${name}</strong><span>Share your experience</span></span><svg class="review-arrow" aria-hidden="true"><use href="#arrow"/></svg></a>`).join('')
  shortcuts.hidden = !entries.length
  tiles.hidden = !entries.length
}
async function loadReceipt() {
  if (!receiptId) { if (current) render(current); return }
  const exports = document.querySelector<HTMLElement>('.receipt-exports')!
  exports.hidden = true
  document.querySelector<HTMLElement>('#merchant-engagement')!.hidden = true
  root.textContent = 'Loading your receipt…'
  try {
    if (!/^[a-f0-9-]{36}$/i.test(receiptId)) throw new Error('Invalid receipt link.')
    const [{ db }, { doc, getDoc }, { validateReceipt }] = await Promise.all([import('./firebase'), import('firebase/firestore'), import('./receipt-parser')])
    const result = await getDoc(doc(db, 'receipts', receiptId))
    if (!result.exists()) throw new Error('Receipt not found. Check your link with the business.')
    current = validateReceipt(result.data().receipt)
    render(current); exports.hidden = false
    // Only review links are public; addresses and owner details remain in the private business record.
    const businessId = result.data().businessId
    if (typeof businessId === 'string' && /^[a-f0-9-]{36}$/i.test(businessId)) {
      void getDoc(doc(db,'businessReviews',businessId)).then(profile => {
        if (profile.exists()) renderReviewTiles(profile.data().reviewLinks ?? {})
      }).catch(() => { /* A missing review profile never prevents viewing the receipt. */ })
    }
  } catch (error) { root.textContent = error instanceof Error ? error.message : 'Could not load your receipt. Please try again.' }
}
void loadReceipt()

/** Export the same content as the receipt, including collapsed details and original. */
async function exportCanvas(r: Receipt) {
  await document.fonts.ready
  const wrapper = document.createElement('div')
  wrapper.innerHTML = root.innerHTML
  const lines: { text: string; heading: boolean }[] = []
  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = '24px sans-serif'
  const wrap = (text: string, heading: boolean) => {
    for (const paragraph of text.split('\n')) {
      let line = ''
      for (const char of paragraph) {
        if (measure.measureText(line + char).width > 820) { lines.push({ text: line, heading }); line = '' }
        line += char
      }
      lines.push({ text: line, heading })
    }
  }
  // Traverse in source order so unknown blocks and original images retain their place.
  const blocks: ({ line: { text: string; heading: boolean } } | { image: HTMLImageElement })[] = []
  async function visit(el: Element) {
    if (el.classList.contains('quick-actions') || el.id === 'business-reviews') return
    if (el instanceof HTMLImageElement) {
      const img = new Image(); img.crossOrigin = 'anonymous'; img.src = el.src; await img.decode(); blocks.push({ image: img }); return
    }
    if (el.classList.contains('receipt-row')) {
      const before = lines.length; wrap(Array.from(el.children).map(c => c.textContent ?? '').join('    '), el.classList.contains('grand-total')); blocks.push(...lines.slice(before).map(line => ({ line }))); return
    }
    if (['H1', 'H2', 'H3', 'P', 'PRE', 'SUMMARY', 'STRONG'].includes(el.tagName) || el.classList.contains('item-quantity') || el.classList.contains('receipt-state')) {
      const before = lines.length; wrap(el.textContent ?? '', /^H[123]$/.test(el.tagName)); blocks.push(...lines.slice(before).map(line => ({ line }))); return
    }
    for (const child of el.children) await visit(child)
  }
  for (const child of wrapper.children) await visit(child)
  const height = 76 + blocks.reduce((sum, b) => sum + ('line' in b ? 38 : Math.min(1100, b.image.height * Math.min(1, 820 / b.image.width)) + 30), 0)
  if (height > 30000) throw new Error('Receipt is too large to export as an image or PDF. Download CSV instead.')
  const canvas = document.createElement('canvas'); canvas.width = 940; canvas.height = height
  const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#fffef9'; ctx.fillRect(0, 0, canvas.width, canvas.height)
  let y = 38
  for (const block of blocks) {
    if ('line' in block) { ctx.fillStyle = block.line.heading ? '#ba1d24' : '#302b25'; ctx.font = `${block.line.heading ? 'bold ' : ''}24px sans-serif`; ctx.fillText(block.line.text, 60, y + 26); y += 38 }
    else { const scale = Math.min(1, 820 / block.image.width, 1100 / block.image.height); ctx.drawImage(block.image, 60, y, block.image.width * scale, block.image.height * scale); y += Math.min(1100, block.image.height * Math.min(1, 820 / block.image.width)) + 30 }
  }
  // Include identity even for merchants represented only by their logo.
  ctx.font = '18px sans-serif'; ctx.fillStyle = '#746b60'; ctx.fillText(`${r.merchant.name} · Powered by CinderTap`, 60, height - 16)
  return canvas
}
function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000)
}
const csvCell = (value: string) => `"${value.replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""')}"`
document.addEventListener('click', async event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-format]')
  if (!button || button.disabled) return
  const receipt = current
  if (!receipt) return
  const format = button.dataset.format
  const showStatus = (message: string) => { status.textContent = message; status.classList.add('visible'); setTimeout(() => status.classList.remove('visible'), 5000) }
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-format]')
  buttons.forEach(b => { b.disabled = true }); button.setAttribute('aria-busy', 'true'); showStatus('Preparing your download…')
  try {
    if (format === 'csv') {
      if (receipt.paid === undefined) throw new Error('No verified transaction amount is available for this image-only receipt. Download the receipt instead.')
      const rows = [['Date', 'Merchant', 'Receipt', 'Currency', 'Amount', 'Status'], [receipt.issuedAt, receipt.merchant.name, receipt.id, receipt.currency, String(-receipt.paid / 10 ** (new Intl.NumberFormat('en', { style: 'currency', currency: receipt.currency }).resolvedOptions().maximumFractionDigits ?? 2)), receipt.status]]
      // The amount column is numeric; untrusted text cells are formula-protected.
      download(new Blob([rows.map((r, i) => r.map((v, j) => i > 0 && j === 4 ? v : csvCell(v)).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${receipt.id}.csv`)
    } else {
      const canvas = await exportCanvas(receipt)
      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF({ unit: 'pt', format: 'a4' })
        const width = 515; const pageHeight = Math.floor(742 * canvas.width / width / 38) * 38
        for (let y = 0; y < canvas.height; y += pageHeight) {
          if (y) doc.addPage()
          const slice = document.createElement('canvas'); slice.width = canvas.width; slice.height = Math.min(pageHeight, canvas.height - y)
          slice.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height)
          doc.addImage(slice.toDataURL('image/png'), 'PNG', 40, 40, width, slice.height * width / slice.width)
        }
        doc.save(`${receipt.id}.pdf`)
      } else {
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create receipt image.')), 'image/png'))
        download(blob, `${receipt.id}.png`)
      }
    }
    showStatus('Your receipt is ready to download.')
  } catch (error) { showStatus(error instanceof Error ? error.message : 'Could not create the file. Please try again.') }
  finally { buttons.forEach(b => { b.disabled = false }); button.removeAttribute('aria-busy') }
})
