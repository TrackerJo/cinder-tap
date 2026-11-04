# Receipt dashboard

Live: https://cindertap.com/dashboard/
Project: https://console.firebase.google.com/project/cindertap-receipts/overview

Create an email/password account in the dashboard, then create a business. Each account owns its businesses and receipts. The dashboard opens on a business list. Select a business to see its receipt history, then choose Create test receipt. Upload a file or use the built-in sample, review the readable preview, optionally edit the raw data, confirm the sharing notice, and create the receipt link. Saving returns to that business’s receipts. Breadcrumbs return to the business list. The generated `/template/?receipt=<UUID>` link loads the stored receipt on any device without sign-in. A refresh retains businesses and saved receipts. Each save creates a new immutable receipt snapshot.

Supported files (max 256 KB):
- JSON matching `Receipt` in `src/receipt-model.ts`. “Download example JSON” provides a starting file. Amounts are integer currency minor units.
- UTF-8 plain text with quantity/name/price lines and explicit subtotal/tax/total labels.
- ESC/POS .bin/.prn files using the supported text/formatting subset in `src/receipt-parser.ts`. Unknown commands fail rather than inventing a receipt. Raster images, QR/barcode commands, code pages other than UTF-8, PDFs, and scanned receipts are not parsed in this version.

Text extraction is heuristic. Upload time and business currency/timezone provide defaults; payment status stays “Not extracted” unless an explicit paid line is present. Review all fields against the original before saving. Discounts, fees, weighted goods, and unfamiliar layouts may require manual corrections. A real parser integration can replace `parseText` while retaining validation, storage, and rendering.

Firestore stores `businesses` and immutable `receipts`, with owner IDs and business IDs. Context/detail pairs are encoded as maps to avoid Firestore's nested-array restriction. Rules prevent anonymous writes, public collection listing, and access to another owner's businesses. Individual published receipt documents are accessible to anyone holding the random link; do not upload private data you would not want included in that receipt. This prototype has no link expiry or revocation UI. Unknown fields are discarded by validation, and the template escapes supplied text. Real stored receipts do not inherit fictional sample coupons/review prompts.

The Firebase web configuration is public app identification, not an administrative credential. No service-account key is included. Authentication is email/password; no billing account was attached. Firestore uses the default free-tier database in us-east4. GitHub Pages serves the built static app at cindertap.com. Firebase handles authentication and Firestore storage. The Firebase Hosting deployment remains available as a fallback.

Development: `npm run dev`, open `/dashboard/`. `npm test` checks validation, printer decoding, and storage round trips. `npm run test:firebase` runs live isolation tests using temporary synthetic users/documents and cleans them up. `npm run build` builds all routes. Push to main to run tests/build and deploy through the GitHub Pages workflow. Deploy database rules separately with `firebase deploy --only firestore:rules --project cindertap-receipts`. Public test files live at `/test-receipts/`.
