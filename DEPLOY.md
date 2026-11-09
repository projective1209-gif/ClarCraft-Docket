# Publish Docket as a PWA on GitHub Pages

## 1. Prepare the repository

Create a repository in your GitHub account with default branch `main`. For example, name it `docket`. Choose visibility appropriate to your GitHub plan and distribution intentions. GitHub Pages availability for private repositories depends on the plan.

Extract `Docket-v1.4-PWA-GitHub.zip`. Put the **contents of `Docket-PWA/` at the repository root**. The repository must show `index.html` immediately, not inside a second `Docket-PWA` directory.

Include hidden files and folders, especially `.github/workflows/pages.yml`. Some file managers hide dotfiles, and some browser-upload flows omit hidden folders. Using Git avoids this:

```sh
cd path/to/Docket-PWA
git init
git branch -M main
git add .
git commit -m "Publish Docket PWA v1.4"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the placeholders with your repository details. These commands assume a new, empty remote repository. If you already have a repository, clone it and copy the project into it rather than overwriting unrelated work or force-pushing.

**Do not commit real customer records, exported backups, credentials or private invoices.** This package's fixture and sample invoice are fictional. `tests/results/`, `backups/`, `.env` and generated folders are ignored. Git ignores do not remove files that were already committed.

## 2. Enable Pages and deploy

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Open **Actions → Deploy Docket to GitHub Pages**.
4. If necessary, select **Run workflow → main**. Future pushes to `main` trigger deployment automatically.
5. Wait for a successful run. The deploy job reports the actual hosted URL.
6. Open that URL in a normal browser tab, not a GitHub source-file preview.

The supplied workflow stages only production assets. It does not require an npm build or runtime server. GitHub runs official Pages configuration, artifact upload and deployment actions, using its temporary workflow token; no personal access token or application secret is required.

The workflow expects `main`. If your default branch differs, update `branches: [main]` in the workflow. If Actions is restricted by your organisation, ask an administrator to enable the required actions and Pages deployment permissions.

For a project repository the address is normally:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

For a repository named `YOUR-USERNAME.github.io`, it is normally the origin root. Relative manifest, icon, script and service-worker paths support both cases. No client-side router rewrites are needed: navigation uses hashes.

## 3. Verify the live release

- HTTPS works and the initial profile setup is empty.
- A country/currency selector opens with a working search field.
- Developer page shows **ClarCraft**.
- **Ready for offline use** appears after the first complete load.
- DevTools → Application → Manifest shows valid icons and standalone display.
- DevTools → Application → Service Workers shows an activated worker scoped to the app path.
- Reload with the network disabled; the app still opens and existing records remain.
- Restore your own backup only in your own browser, never by placing it in the repository.
- Preview a test invoice and print to PDF before using the release for actual billing.

You must visit online at least once before offline use. Visiting an uncached site for the first time while offline cannot work.

## 4. Installation

Use the **Install app** button when the browser exposes an install prompt. Otherwise it shows platform-specific instructions:

- Chrome/Edge desktop or Android: browser Install app / Add to Home screen.
- iPhone/iPad: Safari → Share → Add to Home Screen; enable Open as Web App if offered.
- macOS Safari: File → Add to Dock where available.
- Firefox: use the website with offline caching; desktop installation is browser/platform-dependent.

An install prompt is not guaranteed to appear immediately; browsers apply their own eligibility and interaction rules. Physical-device install UX has not been independently tested here. This is a hosted PWA, not an APK/IPA or app-store submission.

Export JSON before switching browsers or installing. Storage may differ between browser and installed app on some platforms. If the installation opens with an empty workspace, complete setup if necessary and restore the exported JSON.

## 5. Future updates

Push updated files to `main`. The workflow automatically stamps the staged `sw.js` cache version with the commit ID. You do not need to change that version manually for this workflow.

Existing users continue running a coherent cached release until the new complete shell has downloaded. **Update available** asks before reloading. Saved localStorage records are retained. Other open tabs do not reload automatically, protecting unsaved form inputs. A waiting worker may activate naturally once all old tabs are closed.

If you deploy manually to another host, **change `VERSION` in `sw.js` for every release that changes an app-shell file**. If you add runtime files, add them to the worker's `FILES` list and the workflow's staging list. Publish the complete file set together; an incomplete cache download must not replace a working release.

Service-worker cache names include the app's scope, so one deployment does not delete another app's caches. However, **localStorage is origin-wide**: Docket projects on the same `username.github.io` origin share the existing workspace key. For separate businesses, use separate origins rather than merely different repository paths.

## 6. Custom domains and data migration

You can configure a custom domain in GitHub Pages and your DNS provider. No `CNAME` is bundled because no domain was provided. Follow GitHub's domain verification and HTTPS settings for your own domain.

A new domain is a new storage origin. Export a JSON backup from the old address, visit the new address, and restore the backup there. Installing on a new origin does not transfer data automatically. Never clear old browser data until the migrated workspace has been verified.

## Troubleshooting

**404 / no site:** Check that Pages uses GitHub Actions, the workflow succeeded, the branch is correct and `index.html` is at the root. Open the deployed Pages URL, not `github.com/.../blob/...`.

**Only the previous design appears:** Finish editing and accept the available update. Close all tabs for the old app and reopen if needed. Before using DevTools to unregister a worker or clear caches, export JSON. Avoid clearing site storage unless you have a verified backup; that can erase localStorage too.

**No install button from the browser:** Use HTTPS in a full browser tab. Confirm the manifest and icons return HTTP 200 and the worker activates. Private browsing, embedded previews, browser policy and unsupported platforms may prevent installation.

**Offline load fails:** Wait for Ready for offline use after a full online visit. Check for missing files/404s in the worker install. Browser storage can be evicted; reconnect to recache. Keep independent JSON backups.

**Update never becomes available:** The deployed service-worker content must change. The supplied workflow handles versioning; a manual upload requires a version bump. Check for a failed cache installation caused by a missing asset.

**Install seems to lose records:** Browser and installed contexts may not share storage on your platform. Restore a JSON backup in the installed app. GitHub stores only static application files, not your business records.

## Before public distribution

Review `LICENSE.md`, end-user terms, privacy wording and local tax/invoice requirements. Public source visibility is not automatically an open-source licence. Preserve bundled font licence notices. Do not promise cloud backups, live exchange rates, universal tax compliance or installation on every browser.
