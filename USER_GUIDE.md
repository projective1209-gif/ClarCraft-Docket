# Docket v1.4 — User guide

**Developed by ClarCraft.**

A responsive, single-user HTML / CSS / JavaScript workspace for clients, projects, invoices, payments, expenses and reports. No backend, account, build step or cloud database is required.

## Start

1. Open your HTTPS-hosted Docket address. For GitHub Pages setup, see `../DEPLOY.md`.
2. Load it online once and wait for **Ready for offline use**. Install from the footer/browser menu if supported. For local testing, run `python -m http.server 3000` from the app folder and visit `http://localhost:3000`. Direct file URLs cannot register a service worker.
3. First visits open a two-step business-profile setup. Choose your region, locale, base currency and date format, then invoice/payment and tax defaults.
4. Your workspace starts empty. Add your first client and invoice. Optional international sample data is available only through Settings after confirmation.
5. Export a JSON backup regularly, and always before clearing browser data or moving the app to a different browser, device or origin.

The app is written in English. Regional preferences format numbers and dates; they do not translate the interface or determine local legal requirements.

## Region, currency and formats

- **Country / region:** choose from ISO country/territory codes. This is profile information; it does not automatically apply a country's tax rules.
- **Locale:** enter a valid locale tag, such as `en-US`, `en-GB`, `de-DE`, `fr-FR`, `ja-JP`, `en-IN` or `ar-AE`. Common choices are suggested, but the field also accepts other valid tags supported by your browser.
- **Base reporting currency:** choose the currency used for consolidated dashboard, client and report totals.
- **Date display:** regional, DD/MM/YYYY, MM/DD/YYYY or YYYY-MM-DD. Stored and exported dates use YYYY-MM-DD.
- **Transaction currencies:** invoices, expenses and project rates can use a currency different from the base. Monetary amounts use currency symbols. ISO codes remain in currency selectors, FX instructions, exports and invoice identification to distinguish currencies sharing the same symbol. Browser internationalisation falls back to a code when no localised symbol is available. Dropdowns include search fields for names, symbols and codes.
- **Precision:** invoice and payment totals respect the currency's ISO minor units, including zero-decimal currencies such as JPY and three-decimal currencies such as KWD. Unit prices can retain up to six decimal places.

Currency availability comes from the browser's internationalisation support (159 choices in the tested Chromium version). It is not a cryptocurrency or live-market-rate service.

### Protecting historical records

The base currency is locked while any business records exist. Changing a label must not silently reinterpret historical amounts. To begin with a different base currency, export a backup and clear records, then change the base currency in Settings. This is not an automatic base-currency migration or a multi-business account switcher.

Changing your locale, date display, default tax or default FX rates does not change existing transaction amounts, currencies or saved FX rates. Existing invoices retain their saved tax labels and rates. Explicitly editing a record changes that record; invoice currency cannot be changed while linked payments exist.

## Manual exchange rates

Docket deliberately uses **manual rates**, so it stays offline and independent of API subscriptions or external providers.

Enter how many units of your base currency equal **1 unit of the transaction currency**.

Example: base USD, invoice EUR, rate `1.08` means **1 EUR = 1.08 USD**. A EUR 100 invoice has a USD 108 reporting equivalent. This is an illustrative rate, not a current market quote.

- Settings → Default exchange rates stores reusable defaults and an optional reference date.
- A new transaction in a foreign currency requires a positive rate. If no default exists, enter the rate manually before saving.
- A base-currency transaction always uses a rate of 1.
- Invoices and expenses each store their own rate.
- Payments are recorded in the **invoice's currency**, with their own saved exchange rate for the date of receipt. They may therefore use a different rate from the invoice.
- Updating a default rate never rewrites existing invoices, payments or expenses.
- Selecting a different transaction currency does not convert the amounts you typed. Enter the actual amounts denominated in that currency; FX conversion is for consolidated reporting.

Rates must be positive; the form supports rates from 0.00000001 to 1,000,000,000. Docket does not fetch current or historical rates, process payments, perform currency trades, revalue receivables, or maintain a separate realised/unrealised FX gain/loss ledger.

## Financial conventions

- **Income:** payments received, excluding proportional invoice tax, converted at each payment's saved rate.
- **Expenses:** amounts before tax, converted at each expense's saved rate. Tax input is recorded separately; the app does not determine whether it is recoverable.
- **Net profit:** income minus expenses on this simple cash basis.
- **Client billed totals:** invoice totals, including tax, converted at each invoice's saved rate.
- **Outstanding:** native-currency balances converted at each invoice's saved rate, not a live rate.
- **Rounding:** converted receipt income and expenses are rounded per transaction to the base currency's precision, then aggregated. Transaction totals and payment balances use the transaction currency's precision.
- **Tax reserve:** the configured percentage of positive net profit. New workspaces start at 0%; choose a percentage appropriate for your circumstances. This is a planning reserve, not a tax-liability calculation.

Statuses: Paid when native-currency balance is zero; Overdue when a positive balance remains after the due date; otherwise Partial if a payment exists; otherwise Pending. An overdue invoice may also have partial payments. Ageing buckets are 0–30, 31–60 and more than 60 days past due.

## Configurable taxes and payment instructions

New workspaces start with tax off (0%), rather than assuming a country's tax rate. Set your own tax label, for example VAT, GST or sales tax, and default percentage. You can apply or disable tax on individual invoices.

Choose a single tax, or two equal components with custom labels. In the two-component option, the entered total rate is split equally; it is not two independently configured tax rates. Tax is calculated on the entire invoice's pre-tax subtotal. Inclusive pricing, line-specific exemptions and multi-rate invoices are not supported.

Business/client tax registration IDs are generic text fields. Bank details can contain IBAN, SWIFT/BIC, routing, account or other payment instructions. Payment account/link text is informational only. Modes include bank transfer, card, cash, PayPal, digital wallet, UPI and other; older `Bank` records remain compatible. No payment processing or automatic bank reconciliation is included.

**Regional preferences do not guarantee local compliance.** This is not statutory accounting or tax-filing software. It does not determine tax registration, sales-tax nexus, place of supply, withholding, credit eligibility, country-specific e-invoicing, mandated invoice content or tax liability. Review invoices and settings with a qualified local adviser.

## Backup, import and export

### JSON: full backup and restoration

Export backup includes the profile, region, base currency, rate defaults, all transaction currencies/rates, tax snapshots, logo and records. Restore validates the file, displays its name and record counts, and asks before replacing the complete workspace. It does not merge. Files over 8 MB, unsupported schemas, invalid references or missing/invalid financial metadata are rejected.

Import must successfully write the replacement to browser storage before replacing the current in-memory workspace. If storage is unavailable or full, current records stay unchanged. Backups contain sensitive client and bank details; store them securely.

### Older Docket backups

Original v1.0–v1.2 backups had a single implicit currency: INR. On import or load, v1.4 explicitly assigns INR, a rate of 1 and the original GST labels. It preserves record amounts, original subtotal-rounding behaviour and balances; it never relabels old values as USD or another currency. Your old browser storage key is retained for same-origin upgrades.

New exports use **backup schema version 2**. Import them with Docket v1.3 or later; older app releases do not support multi-currency backups. Keep an original backup before upgrading.

### CSV: data export

Invoice and expense CSV exports include native currency, saved exchange rate and base-currency equivalents. They export all records, independent of the current screen's filters. CSV uses UTF-8 with BOM, comma delimiters, ISO dates and machine-readable decimal-point numbers; the display locale does not alter the numeric export format. Quoted text, commas and line breaks are escaped, and formula-like cells are prefixed defensively for spreadsheets.

CSV is not an import/restoration format. Use JSON to move the full workspace.

## Printing

Open an invoice → Print / PDF → choose Save as PDF or your printer. Use A4 and disable browser headers/footers. Only the invoice prints, not the application controls. The invoice uses its saved currency and tax labels, and current business/formatting preferences. Review every print preview before sending it.

## Privacy and hosting

Your records live in localStorage on this browser profile and origin. There is no cloud sync, authentication, encryption at rest, server-side database or automatic backup. Private browsing or clearing browser data may erase records. Anyone with access to the browser profile may see them. Logo uploads are limited to 500 KB.

Upload the folder contents to any static host. No build command or backend is required; `index.html` is the entry point. Hash navigation requires no special server-side routes. Each visitor gets an independent browser-local workspace. A permanent public deployment or storefront must be configured in your own hosting/sales account; an Arena preview is not a permanent hosting service.

Restricted attachment viewers may block storage, downloads or printing. The app can render and navigate there, but cannot grant itself browser permissions. Use a normal browser or live hosted preview for full operation. Same-origin hosted files share the stored workspace, including different repository paths on one GitHub Pages origin. Export/restore when switching origins. PWA installation may use a different storage container on some platforms; restore a backup if it opens empty.

## Developer

**ClarCraft** is the developer of Docket. The app includes a dedicated Developer page and a footer credit. No external developer contact information or website is assumed.

## Brand and PWA operation

Palette: Aubergine `#30202F`, Pistachio `#B8C77A`, Apricot `#D99579`, Celadon `#DCE4C8`, Mauve `#A58A9B`, Paper `#F1EEE3`.

Instrument Serif and DM Sans are bundled under SIL OFL with their notices. The app has no external font or script dependencies. General Sans binaries are not redistributed.

The manifest and service worker make the hosted app installable where the browser supports installation. A completed first online load caches the application shell, fonts and icons. Your records remain in localStorage, separately from this cache. Offline status does not mean your data is backed up.

An update waits for confirmation before reloading the current tab. Export a backup first if needed, and finish or cancel unsaved forms. Other open tabs retain their current page and show a reload control. Installation instructions are available from the **Install app** button.

A4 invoice printing uses symbol-based totals with the currency's minor units, wrapping addresses/descriptions, repeating table headings and a highlighted balance due. Chromium supports the invoice-reference/page-number margin footers; other browsers may omit them. Disable the browser's own headers/footers to avoid duplicate URL/date annotations. Check every final print preview, especially very long notes or unusual scripts.

For hosting, licence review and file structure, see the repository README. Review buyer/end-user terms, font permissions and local requirements before publishing. This app does not include a checkout, cloud account, permanent hosting, legal review or compliance certification.
