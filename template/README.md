# Receipt template

Select a simulated receipt with `/template/?type=restaurant`. No selector is shown on the page. Missing or unknown types fall back to `restaurant`; values are case-insensitive. `/demo/` is unchanged.

Available types: `restaurant`, `retail`, `market`, `split-payment`, `unpaid`, `refund`, `long-receipt`.

- `src/receipt-model.ts` defines the normalized receipt contract. Amounts use integer currency minor units; quantities can be fractional. Item totals and adjustments are supplied by the source, not recalculated by the page. Order adjustments and exclusive taxes belong between subtotal and total; included taxes are labeled separately. Tip is separate from purchase total, and paid/balance are supplied explicitly.
- `src/receipt-samples.ts` contains clearly fictional data and simulated original printer text. None is a verified capture from a POS.
- `src/receipt-template.ts` renders optional sections, escapes supplied text, and builds downloads from the same receipt content, including collapsed details. CSV is a generic transaction export, not a direct accounting integration. It uses amount paid (negative for purchases, positive for refunds), not the unpaid purchase total. An image-only receipt without an extracted paid amount cannot produce a transaction CSV.
- Original text/image and additional ordered blocks retain information the normalizer cannot interpret. `codes` accepts source-provided barcode/QR images and readable values; it does not invent return codes.
- Long PDF exports paginate. PNG/PDF have a 30,000 pixel image-height limit; originals may span PDF pages. PDF output is rasterized, not selectable text.

Stored receipt links now load Firestore documents via `/template/?receipt=<UUID>`; query-param samples remain available. The upload workflow and supported parser subset are documented in `dashboard/README.md`. NFC claiming is not implemented. A future ingestion service must validate incoming data and supply captured originals, normalized values, and permitted image URLs before rendering. Current media supports local paths and HTTPS, not arbitrary URL schemes.

Manual verification: all seven scenarios at 375px with no horizontal overflow; unpaid balance; collapsed payment details; split-payment CSV contents; 60-item PDF download; TypeScript and production build. `npm run lint` currently fails before checking files because the installed typescript-eslint does not support the repository's TypeScript 7 version.

The template reuses `/demo` receipt styles, merchant identity, review placeholder, coupon sheet/copy interaction, and accounting export choices. Pizza Company sample receipts show merchant promotions; unrelated merchants do not inherit Pizza Company offers. Merchant actions are excluded from receipt exports.
