import { z } from 'zod'
import type { Receipt } from './receipt-model'
const text = z.string().max(20000)
const amount = z.number().int().safe()
const adjustment = z.object({ label: text, amount })
const pairs = z.array(z.union([z.tuple([text, text]), z.object({ label: text, value: text }).transform(p => [p.label, p.value] as [string, string])])).max(100)
export const receiptSchema = z.object({
  id: text.min(1), merchant: z.object({ name: text.min(1), logo: text.optional(), branch: text.optional(), address: z.array(text).optional(), phone: text.optional(), website: text.optional(), registration: text.optional() }),
  issuedAt: z.string().refine(s => !Number.isNaN(Date.parse(s)), 'Enter a valid receipt date'),
  timeZone: z.string().refine(s => { try { new Intl.DateTimeFormat('en', { timeZone: s }); return true } catch { return false } }, 'Invalid timezone'),
  currency: z.string().regex(/^[A-Z]{3}$/), status: z.enum(['Paid','Partially paid','Unpaid','Refunded','Void','Not extracted']), kind: z.enum(['Sale','Refund','Void']), orderNumber: text.optional(), context: pairs.optional(),
  items: z.array(z.object({ name: text.min(1), quantity: z.number().finite(), unit: text.optional(), unitPrice: amount, total: amount, sku: text.optional(), variants: z.array(text).optional(), modifiers: z.array(text).optional(), notes: z.array(text).optional(), adjustments: z.array(adjustment).optional() })).max(500).optional(),
  subtotal: amount.optional(), adjustments: z.array(adjustment).optional(), taxes: z.array(z.object({ label: text, rate: text.optional(), amount, included: z.boolean().optional() })).optional(), total: amount.optional(), tip: amount.optional(), paid: amount.optional(), balance: amount.optional(),
  payments: z.array(z.object({ method: text, amount, last4: z.string().regex(/^\d{4}$/).optional(), tendered: amount.optional(), change: amount.optional(), reference: text.optional() })).optional(),
  details: pairs.optional(), messages: z.array(z.object({ title: text, text })).optional(), codes: z.array(z.object({ label: text, image: text, value: text.optional() })).optional(), extra: z.array(z.object({ title: text, lines: z.array(text) })).optional(),
  original: z.object({ label: text, text: z.string().max(200000).optional(), image: text.optional() }),
})
export function validateReceipt(input: unknown): Receipt {
  const result = receiptSchema.safeParse(input)
  if (!result.success) throw new Error(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).slice(0,5).join('\n'))
  return result.data
}
// Capture text from a conservative ESC/POS subset, never decode arbitrary image bytes as items.
export function printerText(bytes: Uint8Array): string {
  const output: number[] = []
  for (let i = 0; i < bytes.length;) {
    const byte = bytes[i++]
    if (byte === 0x1b || byte === 0x1d || byte === 0x10) {
      const command = bytes[i++]
      if (byte === 0x1b && command === 0x40) continue
      if (byte === 0x1b && [0x61,0x45,0x2d,0x4d,0x74,0x21,0x33,0x64,0x4a,0x20].includes(command)) { i++; continue }
      if (byte === 0x1b && command === 0x32) continue
      if (byte === 0x1b && command === 0x70) { i += 3; continue }
      if (byte === 0x1d && [0x21,0x42,0x48,0x68,0x77].includes(command)) { i++; continue }
      if (byte === 0x1d && command === 0x56) { const mode = bytes[i++]; if (mode === 65 || mode === 66) i++; continue }
      if (byte === 0x10 && command === 0x04) { i++; continue }
      throw new Error(`Unsupported printer command at byte ${i - 2}. Upload normalized JSON or a plain-text receipt instead. No data has been saved.`)
    }
    if (byte === 9 || byte === 10 || byte === 13 || byte >= 32) output.push(byte)
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(output)).trim()
}
export function parseText(source: string, merchant: Receipt['merchant'], options: { currency?: string; timeZone?: string } = {}): { receipt: Receipt; warnings: string[] } {
  const lines = source.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  const currency = options.currency ?? 'USD'
  const scale = 10 ** (new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2)
  const value = (s: string) => Math.round(Number(s.replace(/,/g, '')) * scale)
  const ending = /(?:\$\s*)?(-?\d+(?:,\d{3})*\.\d{2})\s*$/
  let subtotal: number | undefined, total: number | undefined, tax: number | undefined, paid: number | undefined
  const items: NonNullable<Receipt['items']> = []
  for (const line of lines) {
    const match = line.match(ending); if (!match) continue
    const n = value(match[1]); const label = line.slice(0, match.index).trim()
    if (/^(sub\s*total)\b/i.test(label)) subtotal = n
    else if (/^(grand\s+total|total|amount\s+due)\b/i.test(label)) total = n
    else if (/^(tax|sales tax|vat|gst)\b/i.test(label)) tax = (tax ?? 0) + n
    else if (/^(amount paid|paid)\b/i.test(label)) paid = n
    else if (/^(cash|change|visa|mastercard|tip|service|discount|coupon|deposit|delivery|round)/i.test(label)) continue
    else {
      const item = label.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
      if (!item) continue
      const quantity = Number(item[1]); if (quantity <= 0) continue
      items.push({ name: item[2].trim(), quantity, unitPrice: Math.round(n / quantity), total: n })
    }
  }
  const receipt: Receipt = { id: `TEST-${crypto.randomUUID().slice(0,8)}`, merchant, issuedAt: new Date().toISOString(), timeZone: options.timeZone ?? 'America/Indiana/Indianapolis', currency, kind: 'Sale', status: paid === undefined ? 'Not extracted' : paid === 0 ? 'Unpaid' : total !== undefined && paid < total ? 'Partially paid' : 'Paid', items, ...(subtotal !== undefined ? {subtotal}:{}), ...(total !== undefined ? {total}:{}), ...(tax !== undefined ? {taxes:[{label:'Tax',amount:tax}]}:{}), ...(paid !== undefined ? {paid}:{}), original: { label:'Uploaded printer text', text:source } }
  return { receipt, warnings: ['Review before saving. Date defaults to upload time; currency defaults to the business currency (USD if unspecified). Confirm both.', 'Text parsing is heuristic. Check items, quantities, unit prices, taxes, discounts, payment status, and totals against the original. Unrecognized lines remain in the original receipt.', ...(total === undefined ? ['No total found. Enter the actual total in minor units before saving.'] : [])] }
}

/** Firestore cannot store nested arrays, so encode label/value tuples as maps. */
export function storedReceipt(receipt: Receipt) {
  return JSON.parse(JSON.stringify({ ...receipt,
    ...(receipt.context ? { context: receipt.context.map(([label,value]) => ({label,value})) } : {}),
    ...(receipt.details ? { details: receipt.details.map(([label,value]) => ({label,value})) } : {}),
  })) as Record<string, unknown>
}
