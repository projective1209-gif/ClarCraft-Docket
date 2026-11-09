# Docket · v1.4

### Your business workspace. Developed by ClarCraft.

A responsive, installable **Progressive Web App** for clients, projects, invoices, receipts, expenses and reports. Static HTML, CSS and JavaScript. **No backend, login, build framework, external API or cloud database.**

## What is included

- A blank first-run business setup; fictional demo data is optional.
- Regional date/number formats, multiple currencies and saved manual exchange rates.
- **Currency symbols** for monetary amounts, with ISO codes retained in selectors, exchange-rate instructions, CSV and invoice identification. Browser internationalisation may fall back to a currency code when no localised symbol is available.
- **Searchable selections:** country/region, currencies, clients, projects, statuses, payment modes, tax presentation, categories and other dropdowns. Search names/codes/symbols, use arrow keys and Enter, or Escape to cancel. Locale remains a typeable field supporting valid locale tags.
- A refined **A4 invoice** with precise minor units, tax breakdowns, payment/balance summaries, wrapping descriptions and repeating table headers. Chromium print output includes page numbers and the invoice reference on every page; support for page-margin footers varies by browser.
- JSON backup/restoration, formula-safe CSV exports, and compatible migration of earlier INR records.
- PWA manifest, regular/maskable icons, iOS touch icon, complete offline app-shell cache, install guidance and consent-based updates.
- A dedicated **ClarCraft** Developer page.

[View the fictional sample invoice](docs/sample-invoice.pdf) · [User guide](docs/USER_GUIDE.md) · [Deployment instructions](DEPLOY.md) · [Verification](QA.md)

## Publish on GitHub Pages

1. Create a repository, for example `docket`, with the default branch **`main`**.
2. Upload **the contents of this folder to the repository root**, including `.github/workflows/pages.yml`, `.gitignore` and `.nojekyll`. Do not upload only the ZIP, and do not put another `Docket-PWA` folder around the files.
3. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Commit/push the files. Open **Actions → Deploy Docket to GitHub Pages**. If the push occurred before Pages was enabled, use **Run workflow**.
5. Wait for a successful deployment and open the URL reported by the workflow. A project repository normally uses `https://YOUR-USERNAME.github.io/docket/`.
6. Load the app online once. When **Ready for offline use** appears, it can reload without a network connection. Use **Install app** or your browser's installation menu.

All paths are relative: the same package supports project subpaths and a site-root deployment. The workflow stamps each deployed service worker with the commit ID, so future commits automatically create a new cache version. It publishes only runtime app files, assets and icons—not tests, sample invoices or your local backups.

**This ZIP is ready to upload, but it has not been published to your GitHub account.** Hosting, repository visibility and custom domains are configured in your account. See [DEPLOY.md](DEPLOY.md) for complete steps and troubleshooting.

## Run locally

No npm installation is needed to use the app:

```sh
cd path/to/Docket-PWA
python -m http.server 3000
```

Open `http://localhost:3000`. Localhost is permitted for service-worker development. A downloaded `file://` page, an insecure remote HTTP host, or an embedded attachment preview cannot provide normal PWA installation/offline registration. Use HTTPS for production.

## Install and update

- **Chrome / Edge / Android:** Install app or Add to Home screen when offered.
- **iPhone / iPad:** open the hosted address in Safari → Share → Add to Home Screen. Choose Open as Web App if offered.
- **macOS Safari:** File → Add to Dock where supported.
- **Firefox:** the web workspace and offline cache work; desktop installation availability varies.

Install UI and storage behaviour depend on the browser/device. A PWA is not an App Store/Play Store package. Installation does not create cloud sync or an online account.

A downloaded update waits for your approval. **Update available** asks before reloading. Saved local records remain intact; unsaved form inputs in the updating tab will be discarded only after you confirm. Other open tabs are not forcibly reloaded. A waiting service worker can also activate naturally after all old tabs are closed.

## Data and financial safeguards

Data remains in this browser's localStorage. It is **not encrypted, synced or backed up by GitHub**. Export JSON regularly and before changing origins, browsers, devices or installations. If an installed app opens empty, restore your backup. Browser storage can be cleared or evicted; offline caching is not a data backup.

The existing `hisaabdesk.v1` storage key is intentionally retained so same-origin upgrades keep earlier records. LocalStorage is origin-wide, not path-isolated: multiple Docket repositories under the same `username.github.io` origin can share the same workspace. Use separate origins for separate businesses and back up before moving a site or adding a custom domain.

Manual FX rates are not live market quotes. Base reporting currency is locked once records exist; transaction currencies can differ. Tax configuration does not establish legal compliance. Docket is not statutory accounting, payment-processing, e-invoicing or tax-filing software. See the user guide for the financial conventions and limits.

## Repository contents

```text
.github/workflows/pages.yml  GitHub Pages deployment and cache versioning
.gitignore                  Generated files and backup exclusions
.nojekyll                   Static-host marker
index.html                  Application shell
app.js                      Workspace, calculations, forms and exports
style.css                   Brand, responsive components and print styles
select-enhancements.js      Searchable form selectors
pwa.js                      Install, offline-status and update controls
sw.js                       Versioned offline service worker
manifest.webmanifest        PWA metadata and icon references
assets/                     Instrument Serif + DM Sans and OFL notices
icons/                      SVG, 192px/512px PNG, maskable and iOS icons
docs/                       User guide and fictional sample invoice
tests/                      Reproducible browser regressions and fixture
package.json                Optional development/test commands
package-lock.json           Locked development dependencies
DEPLOY.md / QA.md / LICENSE.md
```

No legacy standalone build or superseded release ZIP is included. Tests contain only fictional sample records; **never commit real JSON backups, invoices or client data**.

## Developer checks

With Node.js 20+ installed and a local server running on port 3000 in another terminal:

```sh
npm ci
npx playwright install --with-deps chromium firefox
npm run check
npm test
```

`BASE_URL` can point to another local test origin. `npm test` covers global workflows, precision, backup/CSV, selectors, offline reloads, updates, invoices and responsive layouts in Chromium/Firefox. Test PDFs/screenshots/reports are written to ignored `tests/results/`. The invoice suite also regenerates the fictional `docs/sample-invoice.pdf`.

No runtime code depends on npm or external CDNs. Optional Python PDF verification uses `pip install pypdf pymupdf`, then `python tests/check-pdf.py` after the invoice test.

## Design and licensing

Pistachio Ink palette and the existing Docket layout are retained. Instrument Serif and DM Sans are bundled under SIL OFL with their notices. General Sans binaries are **not** included in this public-distribution package because their licence restricts redistribution; the interface uses the OFL alternative.

A public repository does not automatically make its contents open source. `LICENSE.md` retains a draft source-available/end-user licence for your review; it is **not an MIT licence**. Review or replace it before publishing if you intend broader open-source permissions. Third-party font notices must remain intact.
