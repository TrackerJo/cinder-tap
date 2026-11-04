import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseText, printerText, validateReceipt, storedReceipt } from '../src/receipt-parser.ts'
import { samples } from '../src/receipt-samples.ts'
test('every sample validates and survives Firestore serialization',()=>{
 for(const sample of samples) assert.deepEqual(validateReceipt(storedReceipt(validateReceipt(sample.receipt))),validateReceipt(sample.receipt))
})
test('extracts text amounts in minor units without treating totals as items',()=>{
 const {receipt,warnings}=parseText('SHOP\n2 Drinks 5.00\nSUBTOTAL 5.00\nTAX 0.35\nTOTAL 5.35\nCASH 10.00\nCHANGE 4.65',{name:'Shop'})
 assert.equal(receipt.total,535);assert.equal(receipt.items.length,1);assert.equal(receipt.items[0].unitPrice,250);assert.equal(receipt.paid,undefined);assert.ok(warnings.length)
})
test('printer commands are stripped and unsupported image commands fail explicitly',()=>{
 const bytes=Buffer.concat([Buffer.from([27,64,27,97,1]),Buffer.from('1 Coffee 3.00\nTOTAL 3.00'),Buffer.from([29,86,0])])
 assert.equal(printerText(bytes),'1 Coffee 3.00\nTOTAL 3.00')
 assert.throws(()=>printerText(new Uint8Array([29,118,48])),/Unsupported/)
})
test('invalid money, dates and timezones are rejected',()=>{
 const good=samples[0].receipt
 for(const change of [{total:3.14},{issuedAt:'nonsense'},{timeZone:'nowhere'}]) assert.throws(()=>validateReceipt({...good,...change}))
})
