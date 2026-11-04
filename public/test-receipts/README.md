# CinderTap test printer receipts

Upload any .bin file through the receipt dashboard after selecting a business. The .txt companions show the decoded printer text; expected-results.json lists expected parsed amounts in minor units.

These are synthetic ESC/POS print jobs, not real POS captures. They use initialize, alignment, bold, paper feed, and partial-cut commands supported by the current uploader. All amounts use two decimal places; choose a USD business (or CAD for the multiple-tax sample) for testing.

Files:
- 01-coffee-shop.bin: 2 items, total 13.91, paid 13.91, Paid
- 02-pizza-restaurant.bin: 3 items, total 28.89, paid 28.89, Paid
- 03-retail-long-name.bin: 3 items, total 104.86, paid 104.86, Paid
- 04-multiple-taxes.bin: 2 items, total 25.99, paid 25.99, Paid
- 05-unpaid-order.bin: 2 items, total 27.82, paid 0.00, Unpaid
- 06-partial-payment.bin: 1 items, total 85.60, paid 40.00, Partially paid
- 07-long-receipt-60-items.bin: 60 items, total 64.20, paid 64.20, Paid

The parser uses upload time for the date, generates an internal receipt ID, and takes merchant identity/currency/timezone from the selected business. Printed date and number remain in the original text. Multiple printed tax rows currently combine into one Tax row. Partial payment status is recognized, but the outstanding balance is not inferred; add it during review if needed.

These successful-path files deliberately avoid refunds, discounts, tips, weighted goods, and raster commands, which the current text parser does not fully normalize. Review parsed fields before saving.

Regenerate and verify with: node --experimental-strip-types scripts/generate-test-receipts.mjs
