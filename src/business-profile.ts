import { z } from 'zod'
import type { Receipt } from './receipt-model'
export const businessProfileSchema = z.object({
  name:z.string().trim().min(1).max(160),
  address:z.array(z.string().max(1000)).max(20),
  phone:z.string().max(80),
  website:z.string().max(200),
})
export function applyBusinessProfile(receipt: Receipt, profile: unknown): Receipt {
  const result = businessProfileSchema.safeParse(profile)
  return result.success ? {...receipt, merchant:{...receipt.merchant,...result.data}} : receipt
}
