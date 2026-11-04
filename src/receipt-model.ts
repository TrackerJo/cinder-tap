/** Amounts are integer minor units. Quantities may be fractional. */
export interface Receipt {
  id: string
  merchant: { name: string; logo?: string; branch?: string; address?: string[]; phone?: string; website?: string; registration?: string }
  issuedAt: string
  timeZone: string
  currency: string
  status: 'Paid' | 'Partially paid' | 'Unpaid' | 'Refunded' | 'Void' | 'Not extracted'
  kind: 'Sale' | 'Refund' | 'Void'
  orderNumber?: string
  context?: [string, string][]
  items?: { name: string; quantity: number; unit?: string; unitPrice: number; total: number; sku?: string; variants?: string[]; modifiers?: string[]; notes?: string[]; adjustments?: { label: string; amount: number }[] }[]
  subtotal?: number
  adjustments?: { label: string; amount: number }[]
  taxes?: { label: string; rate?: string; amount: number; included?: boolean }[]
  total?: number
  tip?: number
  paid?: number
  balance?: number
  payments?: { method: string; amount: number; last4?: string; tendered?: number; change?: number; reference?: string }[]
  details?: [string, string][]
  messages?: { title: string; text: string }[]
  codes?: { label: string; image: string; value?: string }[]
  extra?: { title: string; lines: string[] }[]
  original: { label: string; text?: string; image?: string }
}
export const money = (receipt: Receipt, amount: number) => {
  const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: receipt.currency })
  const digits = format.resolvedOptions().maximumFractionDigits ?? 2
  return format.format(amount / 10 ** digits)
}
export const dateLabel = (r: Receipt) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: r.timeZone }).format(new Date(r.issuedAt))
