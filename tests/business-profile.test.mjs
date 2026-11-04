import {test} from 'node:test'
import assert from 'node:assert/strict'
import {applyBusinessProfile,businessProfileSchema} from '../src/business-profile.ts'
import {samples} from '../src/receipt-samples.ts'
test('current business details overlay past receipts without changing the transaction',()=>{
 const original=samples[0].receipt
 const profile={name:'Updated Kitchen',address:['New address'],phone:'',website:'new.example',total:1,currency:'EUR'}
 const receipt=applyBusinessProfile(original,profile)
 assert.equal(receipt.merchant.name,'Updated Kitchen');assert.equal(receipt.merchant.phone,'')
 assert.deepEqual(receipt.merchant.address,['New address'])
 assert.strictEqual(receipt.items,original.items);assert.equal(receipt.total,original.total);assert.equal(receipt.currency,original.currency);assert.equal(receipt.issuedAt,original.issuedAt)
 assert.notEqual(original.merchant.name,'Updated Kitchen')
 assert.deepEqual(Object.keys(businessProfileSchema.parse(profile)).sort(),['address','name','phone','website'])
})
test('missing and malformed profiles preserve the saved merchant',()=>{
 for(const profile of [null,{}, {name:''}]) assert.strictEqual(applyBusinessProfile(samples[0].receipt,profile),samples[0].receipt)
})
