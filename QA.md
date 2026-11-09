# Docket v1.4 — Verification

Verified **9 November 2026** against the final PWA source. Detailed machine-readable results are included in `docs/verification-results.json`; the tests themselves are in `tests/`.

## Final results

| Suite | Browser | Passing checks |
| --- | --- | ---: |
| Global setup, currency/FX, CRUD and migration workflows | Chromium | 32 |
| Precision and internationalisation | Chromium | 8 |
| Backup / restore / CSV | Chromium | 9 |
| Interaction and validation edges | Chromium | 11 |
| Searchable selections and offline PWA | Chromium | 13 |
| Repository-subpath hosting and service-worker updates | Chromium | 6 |
| Invoice layout and PDF scenarios | Chromium | 9 |
| Global workflows | Firefox | 32 |
| Searchable selections and offline PWA | Firefox | 13 |

**88 Chromium + 45 Firefox scenario checks passed.**

**440 responsive layout measurements passed:** 220 in each browser across widths 320, 360, 390, 414, 620, 768, 820, 1024, 1280, 1440 and 1920 px. Application pages, setup and dialogs were checked for unintended page-level overflow. Wide tables deliberately scroll within their own containers.

JavaScript syntax checks passed for all four runtime scripts. The functional suites that collect browser page errors reported none.

## Currency symbols and selection search

- Monetary displays verified with `$`, `€`, `£`, `₹` and `¥`; currency precision remains unchanged.
- Currency search accepts symbols, names and codes. Region search stores the original ISO country code, not the query text.
- Keyboard opening, arrow navigation, Enter selection, Escape cancellation and no-result states checked.
- Searching never commits a partial query or submits the enclosing form.
- Modal client/status selections, dynamically inserted FX selectors and locked base-currency selectors checked.
- Popup tested at 320px width and a reduced-height viewport; body overflow remains controlled.
- Native select values remain authoritative for form validation and saved data.

## PWA and updates

- Relative-path manifest, icons, maskable icon and complete 17-resource offline app-shell cache verified.
- First installation does not incorrectly display an update prompt.
- Offline reload retains the exact saved workspace. Main navigation works offline; a newly created offline client survives another reload.
- Local HTTP test server simulated a **GitHub project-repository subpath**, rather than testing only the origin root.
- A second release installed into a separate versioned cache and waited without reloading an open form.
- Cancelling an update preserved unsaved inputs. Confirming loaded the new shell while retaining the exact saved workspace.
- Another open tab was not forcibly reloaded and retained its unsaved input.
- Old app-shell cache was removed only after activation; localStorage was not cleared.
- Updated app reloaded offline under a repository subpath with query parameters and hash navigation.

The actual GitHub workflow has **not** been run in the user's GitHub account. The package includes the workflow and deployment guide; the user must upload and deploy it. Native installation was not driven on physical iOS/Android devices. Install UI depends on browser/platform policy.

## Invoice verification

Eight PDFs were generated with Chromium and independently parsed using `pypdf`:

| Case | A4 pages | Checks |
| --- | ---: | --- |
| Standard EUR invoice with VAT and partial receipt | 1 | €1,140.00 subtotal; €228.00 VAT; €1,368.00 total; €400.00 paid; €968.00 due |
| Tax-free invoice | 1 | No tax row; correct unpaid total |
| INR two-component tax | 1 | CGST/SGST 9% each; ₹102.60 each; ₹1,345.20 total |
| JPY invoice | 1 | ¥2,000 with no invented decimal places |
| KWD invoice | 1 | 0.001 remaining balance retained |
| Fully paid invoice | 1 | Paid status and zero balance |
| Long unbroken text and long reference | 2 | Content wraps without page-level overflow |
| 70-line invoice | 6 | All line items, repeating table headings and final closing content retained |

All PDFs use A4 dimensions, omit the application's navigation, and contain the invoice reference plus correct page/total-page numbering on every page. The standard printed invoice and the final multi-page totals sheet were visually reviewed. A fictional standard invoice is provided at `docs/sample-invoice.pdf`.

The preview's mobile table scrolls independently of the document. Tax names, addresses, invoice references and descriptions can wrap. Totals use the currency's minor units; unit prices retain up to six decimals. Earlier INR aggregate-rounding behaviour remains preserved and is noted on unusual legacy invoices where rounded line values differ from the original subtotal.

Page-margin footer support varies by browser; Chromium's actual PDF output was verified. Physical printers, every script/font combination, arbitrary document lengths and country-specific invoice laws have not been exhaustively tested. Review the print preview before sending a real invoice.

## Existing functionality retained

The regression suites also cover:

- Blank first run, optional fictional demo and all navigation routes, including ClarCraft Developer.
- Regional onboarding; locale validation; immutable base currency once records exist.
- CRM/pipeline, projects/tasks, invoice and expense FX, independent payment FX, partial/final payments and removal.
- Cash income/expenses, tax reserve, outstanding balances and transaction-level rounding.
- Zero-decimal JPY, three-decimal KWD and half-boundary floating-point rounding.
- Historical default-rate/tax changes do not rewrite saved transactions.
- Paid invoice currency changes rejected.
- Exact JSON export → clear → import → reload round trips, including logo/Unicode/metadata.
- Import cancellation and failed persistence preserve current data.
- Invalid schemas, dates, IDs, references, overpayments, FX metadata, excessive file sizes and non-finite amounts rejected.
- CSV escaping, Unicode, newlines, formula-like values, currency/FX/base columns and filter-independent exports.
- Legacy INR backups keep their original amounts, GST labels, balances and rounding; explicit later currency changes apply the new currency precision.
- Destructive confirmation Cancel/Escape and rapid consecutive confirmations.

## Reproduction

Start the local app server on port 3000, then:

```sh
npm ci
npx playwright install --with-deps chromium firefox
npm run check
npm test
pip install pypdf pymupdf
python tests/check-pdf.py
```

`BASE_URL` can target another local test server. The update suite starts and stops its own temporary HTTP server. Results are regenerated under ignored `tests/results/`; current test artifacts are intentionally excluded from the distribution ZIP.

## Limits

These are representative functional and regression tests, not a guarantee of universal compatibility, accessibility conformance, security certification, accounting accuracy for every possible input, or legal/tax compliance. Safari and physical mobile-device installation were not separately tested. The app has no authentication, cloud backup, cloud sync or encryption at rest. Exchange rates remain manual. Export backups regularly.
