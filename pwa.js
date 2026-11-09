/* Install and update controls. No automatic reload of unsaved work. */
(() => {
  const install = document.getElementById("pwa-install");
  const update = document.getElementById("pwa-update");
  const status = document.getElementById("pwa-status");
  let promptEvent = null,
    registration = null,
    applyingUpdate = false,
    offlineReady = false,
    controllerSeen = false;
  const standalone = () =>
    matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true;
  function refresh() {
    install.hidden = standalone();
    status.textContent = navigator.onLine
      ? offlineReady
        ? "Ready for offline use"
        : ""
      : offlineReady
        ? "Offline · saved on this device"
        : "Offline · first online load required";
  }
  window.addEventListener("online", refresh);
  window.addEventListener("offline", refresh);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event;
    refresh();
  });
  window.addEventListener("appinstalled", () => {
    promptEvent = null;
    install.hidden = true;
    toast("Docket is installed. Keep exporting backups regularly.");
  });
  install.addEventListener("click", async () => {
    if (promptEvent) {
      const available = promptEvent;
      promptEvent = null;
      try {
        await available.prompt();
        await available.userChoice;
      } catch {
        toast("Use your browser menu to install Docket.");
      }
      refresh();
      return;
    }
    showModal(
      "Install Docket",
      `<div class="stack"><p>Open your hosted Docket address over HTTPS. Load it online once before using it offline.</p><p><strong>Chrome / Edge / Android:</strong> use the browser’s Install app or Add to Home screen option when available.</p><p><strong>iPhone / iPad (Safari):</strong> choose Share → Add to Home Screen → Add. If offered, enable Open as Web App.</p><p><strong>macOS Safari:</strong> use File → Add to Dock where supported. Firefox may not offer desktop installation; the browser app still works offline after caching.</p><p>Installation depends on your browser and device. Embedded previews and downloaded file URLs cannot install a PWA. Open the actual hosted address in its own tab.</p><p class="report-note">Records stay on this browser/device. Installing is not cloud backup or sync. Export JSON before changing browser, origin or installation; restore it if the installed app opens with an empty workspace.</p></div>`,
    );
  });
  update.addEventListener("click", async () => {
    if (
      !(await confirmAction(
        "Update Docket now? Unsaved form edits will be lost. Saved records will remain on this device. Export a backup first if needed.",
      ))
    )
      return;
    if (registration?.waiting) {
      applyingUpdate = true;
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else location.reload();
  });
  refresh();
  if (
    !("serviceWorker" in navigator) ||
    !["https:", "http:"].includes(location.protocol) ||
    !window.isSecureContext
  )
    return;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (applyingUpdate) location.reload();
    else {
      offlineReady = true;
      refresh();
      if (
        controllerSeen &&
        registration?.active &&
        navigator.serviceWorker.controller
      ) {
        update.hidden = false;
        update.textContent = "Reload app";
      }
      controllerSeen = true;
    }
  });
  window.addEventListener("load", async () => {
    try {
      controllerSeen = Boolean(navigator.serviceWorker.controller);
      registration = await navigator.serviceWorker.register("./sw.js", {
        scope: "./",
        updateViaCache: "none",
      });
      const notify = () => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          update.hidden = false;
          update.textContent = "Update available";
        }
      };
      notify();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed") notify();
        });
      });
      await navigator.serviceWorker.ready;
      offlineReady = true;
      refresh();
      // A versioned, complete app shell is active; business data stays in localStorage.
    } catch {
      status.textContent =
        "Offline installation unavailable · browser app still usable";
    }
  });
})();
