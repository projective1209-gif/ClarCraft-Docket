const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
(async () => {
  const root = path.resolve(__dirname, "..");
  let release = 1;
  const mime = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".webmanifest": "application/manifest+json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
  };
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/sample-repository/")) {
      res.writeHead(404).end();
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice("/sample-repository/".length)) ||
      "index.html";
    const file = path.resolve(root, relative);
    if (
      !file.startsWith(root + path.sep) ||
      !fs.existsSync(file) ||
      !fs.statSync(file).isFile()
    ) {
      res.writeHead(404).end();
      return;
    }
    let content = fs.readFileSync(file);
    if (relative === "sw.js")
      content = Buffer.from(
        content
          .toString()
          .replace(
            /const VERSION = [^;]+;/,
            `const VERSION = 'qa-release-${release}';`,
          ),
      );
    if (relative === "app.js")
      content = Buffer.from(
        content.toString() + `\nwindow.__qaRelease=${release};`,
      );
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "text/plain",
      "Cache-Control": "no-store",
    });
    res.end(content);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://localhost:${server.address().port}/sample-repository/`;
  const b = await chromium.launch();
  let tests = [];
  const test = async (n, f) => {
    await f();
    tests.push(n);
    console.log("PASS", n);
  };
  try {
    const context = await b.newContext();
    const p = await context.newPage();
    await p.goto(base);
    await p.evaluate(async () => {
      await navigator.serviceWorker.ready;
      db = demo();
      save();
      render();
    });
    await p.reload();
    await test("Repository-subpath deployment registers a correctly scoped worker", async () => {
      assert.equal(
        await p.evaluate(
          async () => (await navigator.serviceWorker.getRegistration()).scope,
        ),
        base,
      );
      assert.equal(await p.evaluate(() => window.__qaRelease), 1);
    });
    const before = await p.evaluate(() => JSON.stringify(db));
    const second = await context.newPage();
    await second.goto(base);
    await second.evaluate(() => openClient());
    await second.locator("#modal [name=name]").fill("Unsaved in second tab");
    await p.evaluate(() => openClient());
    await p.locator("#modal [name=name]").fill("Unsaved in first tab");
    release = 2;
    await p.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration()).update();
    });
    await p.waitForFunction(
      async () =>
        (await navigator.serviceWorker.getRegistration()).waiting?.state ===
        "installed",
    );
    await test("A new release waits without reloading or discarding an open form", async () => {
      assert.equal(await p.evaluate(() => window.__qaRelease), 1);
      assert.equal(
        await p.locator("#modal [name=name]").inputValue(),
        "Unsaved in first tab",
      );
      await p.locator("#pwa-update").waitFor({ state: "visible" });
    });
    // Close the deliberately unsaved modal to reach the footer update control; cancellation is then checked with another open form via a direct button click.
    await p.evaluate(() => document.getElementById("pwa-update").click());
    await p
      .locator("#confirm-modal")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await test("Cancelling an update preserves unsaved inputs", async () => {
      assert.equal(
        await p.locator("#modal [name=name]").inputValue(),
        "Unsaved in first tab",
      );
      assert.equal(await p.evaluate(() => window.__qaRelease), 1);
    });
    await p.evaluate(() => document.getElementById("pwa-update").click());
    await p.locator("#confirm-modal [data-confirm-accept]").click();
    await p.waitForFunction(() => window.__qaRelease === 2);
    await test("Confirmed update loads the new shell and preserves the exact saved workspace", async () => {
      assert.equal(await p.evaluate(() => JSON.stringify(db)), before);
      await p.waitForFunction(
        async () =>
          (await caches.keys()).filter((k) => k.startsWith("docket:"))
            .length === 1,
      );
      assert(
        (await p.evaluate(() => caches.keys())).some((k) =>
          k.endsWith("qa-release-2"),
        ),
      );
    });
    await test("Updating one tab does not reload or discard edits in another tab", async () => {
      assert.equal(await second.evaluate(() => window.__qaRelease), 1);
      assert.equal(
        await second.locator("#modal [name=name]").inputValue(),
        "Unsaved in second tab",
      );
      assert.equal(
        await second.locator("#pwa-update").textContent(),
        "Reload app",
      );
    });
    await context.setOffline(true);
    await p.goto(base + "?installed=1#invoices");
    await test("Updated repository-subpath app reloads offline with query and hash navigation", async () => {
      assert.equal(await p.evaluate(() => window.__qaRelease), 2);
      assert.equal(await p.evaluate(() => page), "invoices");
      assert.equal(await p.evaluate(() => JSON.stringify(db)), before);
    });
    fs.mkdirSync(path.join(__dirname, "results"), { recursive: true });
    fs.writeFileSync(
      path.join(__dirname, "results/updates.json"),
      JSON.stringify({ passed: tests.length, tests }, null, 2),
    );
  } finally {
    await b.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
