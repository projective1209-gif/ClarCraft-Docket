/* Bump VERSION for every deployment that changes app-shell files. */
const VERSION = "1.4.0-android-flat2";
const PREFIX = `docket:${self.registration.scope}:`;
const CACHE = PREFIX + VERSION;
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./select-enhancements.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./maskable-512.png",
  "./apple-touch-icon.png",
  "./instrument-serif.ttf",
  "./dm-sans-0.ttf",
  "./dm-sans-1.ttf",
  "./dm-sans-2.ttf",
  "./dm-sans-3.ttf",
];
const assets = new Set(
  FILES.map((path) => new URL(path, self.registration.scope).href),
);
self.addEventListener("install", (event) => {
  // An incomplete download never replaces the previous working shell.
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(
        FILES.map(
          (path) =>
            new Request(new URL(path, self.registration.scope), {
              cache: "reload",
            }),
        ),
      ),
    ),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  url.hash = "";
  url.search = "";
  if (!assets.has(url.href)) return;
  // Cache-first prevents mixing a new HTML shell with an older cached script.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(url.href)) || fetch(event.request);
    })(),
  );
});
