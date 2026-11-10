# ClarCraft Docket — complete Android upload edition

This is the complete, folder-free Docket PWA. Extract the ZIP and upload ALL extracted files to your repository root. Replace existing files of the same names. Do not upload the ZIP itself. No subfolders or GitHub Actions workflow are needed for this edition.

## Publish

Repository Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: / (root) → Save.

For projective1209-gif/ClarCraft-Docket the expected address is:
https://projective1209-gif.github.io/ClarCraft-Docket/

Wait for successful deployment, open the actual site in Chrome and load it online once. After Ready for offline use appears, use Install app or the browser's Add to Home screen option. Browser installation availability varies.

## Data safety

Records stay in localStorage on your browser/device. Export JSON backups regularly. GitHub does not back up or sync business records. Do not upload real backups or client invoices to this public repository. Docket retains its existing origin-wide storage key; Docket apps under the same username.github.io origin can share a workspace even if their repository paths differ. Export a backup before changing addresses or installations.

## Updates

For this branch-deployed edition, change VERSION in sw.js whenever you change runtime files. Unlike the GitHub Actions edition, cache versioning is not automatic. Upload the full changed file set, then accept Update available after finishing any unsaved edits.

## Features and limits

Searchable selectors, currency symbols, manual multi-currency FX, configurable taxes, CRM, projects, invoices, payments, expenses and reports. Invoice preview supports A4 printing. Disable browser print headers/footers and review the result before sending. All data starts blank; demo data is optional. Rates are manual, and the app does not guarantee local tax or invoice compliance. This is not cloud accounting or payment processing.

## Licensing

Developed by ClarCraft. Review the draft source-available LICENSE.md before public distribution; it is not an MIT licence. Instrument Serif and DM Sans are bundled under SIL OFL; preserve their notices. General Sans is not redistributed.
