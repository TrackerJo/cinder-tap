import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { printerText, parseText, validateReceipt } from '../src/receipt-parser.ts'
const output = new URL('../public/test-receipts/', import.meta.url)
await mkdir(output, { recursive: true })
const samples = [
  { file:'01-coffee-shop', merchant:'CORNER COFFEE', lines:['2 Cappuccino                 9.00','1 Butter croissant           4.00'], subtotal:1300, taxes:[['Sales tax',91]], total:1391, paid:1391 },
  { file:'02-pizza-restaurant', merchant:'PIZZA COMPANY', lines:['1 Cheese pizza              14.00','1 Cheesestix                 8.00','2 Fountain drinks            5.00'], subtotal:2700, taxes:[['Sales tax',189]], total:2889, paid:2889 },
  { file:'03-retail-long-name', merchant:'FIELD SUPPLY', lines:['1 Everyday heavyweight cotton overshirt with reinforced pockets 68.00','3 Cotton socks              18.00','1 Canvas tote               12.00'], subtotal:9800, taxes:[['Sales tax',686]], total:10486, paid:10486 },
  { file:'04-multiple-taxes', merchant:'NEIGHBOURHOOD MARKET', lines:['2 Prepared lunch            20.00','1 Sparkling water            3.00'], subtotal:2300, taxes:[['Tax A (5%)',115],['Tax B (8%)',184]], total:2599, paid:2599 },
  { file:'05-unpaid-order', merchant:'PIZZA COMPANY', lines:['1 Large vegetable pizza     20.00','1 Garlic bread               6.00'], subtotal:2600, taxes:[['Sales tax',182]], total:2782, paid:0 },
  { file:'06-partial-payment', merchant:'PIZZA COMPANY', lines:['2 Family pizza bundle       80.00'], subtotal:8000, taxes:[['Sales tax',560]], total:8560, paid:4000 },
  { file:'07-long-receipt-60-items', merchant:'FIELD SUPPLY', lines:Array.from({length:60},(_,i)=>`1 Workshop supply item ${String(i+1).padStart(2,'0')}     1.00`), subtotal:6000, taxes:[['Sales tax',420]], total:6420, paid:6420 },
]
const bytes = (...n) => Buffer.from(n)
const txt = s => Buffer.from(s,'utf8')
const price = n => (n/100).toFixed(2)
const manifest = []
for (const [index,sample] of samples.entries()) {
 const body = [...sample.lines,'--------------------------------',`Subtotal                    ${price(sample.subtotal)}`,...sample.taxes.map(([name,n])=>`${name.padEnd(28)}${price(n)}`)]
 const source = Buffer.concat([
  bytes(27,64), // ESC @ initialize
  bytes(27,97,1),bytes(27,69,1),txt(`${sample.merchant}\n`),bytes(27,69,0),
  txt(`TEST RECEIPT ${String(index+1).padStart(3,'0')}\n2026-11-03 18:42\n`),
  bytes(27,97,0),txt('--------------------------------\n'+body.join('\n')+'\n'),
  bytes(27,69,1),txt(`Total                       ${price(sample.total)}\n`),bytes(27,69,0),
  txt(`Amount paid                 ${price(sample.paid)}\n`),
  txt('--------------------------------\nSYNTHETIC TEST RECEIPT\n'),
  bytes(27,100,3),bytes(29,86,1), // feed and partial cut
 ])
 const decoded = printerText(source)
 const result = parseText(decoded,{name:sample.merchant})
 const receipt = validateReceipt(result.receipt)
 assert.equal(receipt.items.length,sample.lines.length,sample.file)
 assert.equal(receipt.subtotal,sample.subtotal,sample.file)
 assert.equal(receipt.total,sample.total,sample.file)
 assert.equal(receipt.paid,sample.paid,sample.file)
 assert.equal(receipt.taxes[0].amount,sample.taxes.reduce((sum,[,n])=>sum+n,0),sample.file)
 const status=sample.paid===0?'Unpaid':sample.paid<sample.total?'Partially paid':'Paid'
 assert.equal(receipt.status,status,sample.file)
 await writeFile(new URL(`${sample.file}.bin`,output),source)
 await writeFile(new URL(`${sample.file}.txt`,output),decoded+'\n')
 manifest.push({file:`${sample.file}.bin`,items:receipt.items.length,subtotal:sample.subtotal,tax:receipt.taxes[0].amount,total:sample.total,paid:sample.paid,status,bytes:source.length})
}
await writeFile(new URL('expected-results.json',output),JSON.stringify(manifest,null,2)+'\n')
await writeFile(new URL('README.md',output),`# CinderTap test printer receipts

Upload any .bin file through the receipt dashboard after selecting a business. The .txt companions show the decoded printer text; expected-results.json lists expected parsed amounts in minor units.

These are synthetic ESC/POS print jobs, not real POS captures. They use initialize, alignment, bold, paper feed, and partial-cut commands supported by the current uploader. All amounts use two decimal places; choose a USD business (or CAD for the multiple-tax sample) for testing.

Files:
${manifest.map(m=>`- ${m.file}: ${m.items} items, total ${(m.total/100).toFixed(2)}, paid ${(m.paid/100).toFixed(2)}, ${m.status}`).join('\n')}

The parser uses upload time for the date, generates an internal receipt ID, and takes merchant identity/currency/timezone from the selected business. Printed date and number remain in the original text. Multiple printed tax rows currently combine into one Tax row. Partial payment status is recognized, but the outstanding balance is not inferred; add it during review if needed.

These successful-path files deliberately avoid refunds, discounts, tips, weighted goods, and raster commands, which the current text parser does not fully normalize. Review parsed fields before saving.

Regenerate and verify with: node --experimental-strip-types scripts/generate-test-receipts.mjs
`)
console.log(`Generated and verified ${manifest.length} .bin receipts in ${fileURLToPath(output)}`)
