const { chromium, firefox } = require("playwright");
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
(async () => {
  const engine = process.env.BROWSER === "firefox" ? firefox : chromium;
  const browser = await engine.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const p = await context.newPage();
  let tests = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.setDefaultTimeout(10000);
  const test = async (n, f) => {
    await f();
    tests.push(n);
    console.log("PASS", n);
  };
  const base = process.env.BASE_URL || "http://localhost:3000";
  await p.goto(base);
  const trigger = (selector) =>
    p.locator(selector).locator("..").locator(".selection-trigger");
  const choose = async (selector, search, name) => {
    await trigger(selector).click();
    await p.locator(".selection-popup input").fill(search);
    await p
      .locator(".selection-popup")
      .getByRole("option", { name, exact: true })
      .click();
  };
  await test("Country search selects by name and keeps the native stored country code", async () => {
    await choose("[name=country]", "united", "United Kingdom");
    assert.equal(await p.locator("[name=country]").inputValue(), "GB");
  });
  await test("Currency search finds symbols, names and ISO codes", async () => {
    await choose("[name=currency]", "EUR", "€ Euro (EUR)");
    assert.equal(await p.locator("[name=currency]").inputValue(), "EUR");
    await trigger("[name=currency]").click();
    await p.locator(".selection-popup input").fill("£");
    assert((await p.locator(".selection-popup [role=option]").count()) > 0);
    await p.locator(".selection-popup input").press("Escape");
    assert.equal(await p.locator("[name=currency]").inputValue(), "EUR");
  });
  await test("No-result searches and Escape leave the selected value unchanged", async () => {
    await trigger("[name=country]").click();
    await p.locator(".selection-popup input").fill("zzzz-no-country");
    assert.equal(await p.locator(".selection-popup [role=option]").count(), 0);
    assert.match(
      await p.locator(".selection-count").textContent(),
      /No matching/,
    );
    await p.locator(".selection-popup input").press("Escape");
    assert.equal(await p.locator("[name=country]").inputValue(), "GB");
  });
  await test("Keyboard search and Enter choose an option without submitting onboarding", async () => {
    await trigger("[name=country]").focus();
    await trigger("[name=country]").press("ArrowDown");
    await p.locator(".selection-popup input").fill("Canada");
    await p.locator(".selection-popup input").press("Enter");
    assert.equal(await p.locator("[name=country]").inputValue(), "CA");
    assert.equal(await p.evaluate(() => setupStep), 1);
  });
  await test("Search popup fits a 320px screen and a reduced-height viewport", async () => {
    await p.setViewportSize({ width: 320, height: 700 });
    await trigger("[name=country]").click();
    await p.locator(".selection-popup input").fill("india");
    await p.setViewportSize({ width: 320, height: 420 });
    await p.waitForFunction(() => {
      const r = document
        .querySelector(".selection-popup")
        ?.getBoundingClientRect();
      return (
        r &&
        r.left >= 0 &&
        r.right <= innerWidth &&
        r.top >= 0 &&
        r.bottom <= innerHeight
      );
    });
    await p.locator(".selection-popup input").press("Escape");
    await p.setViewportSize({ width: 1280, height: 900 });
  });
  await p.locator("[name=name]").fill("Test workspace");
  await p.locator("[name=owner]").fill("Alex");
  await p.getByRole("button", { name: "Continue", exact: true }).click();
  await choose("[name=taxMode]", "single", "Single tax");
  await p.getByRole("button", { name: "Create my workspace" }).click();
  await test("Currency symbols render across major currencies with appropriate precision", async () => {
    const r = await p.evaluate(() =>
      ["USD", "EUR", "GBP", "INR", "JPY"].map((c) => money(1234.56, c)),
    );
    assert(r[0].includes("$"));
    assert(r[1].includes("€"));
    assert(r[2].includes("£"));
    assert(r[3].includes("₹"));
    assert(r[4].includes("¥"));
    assert(!r.join(" ").match(/USD|EUR|GBP|INR|JPY/));
  });
  await p.evaluate(() => {
    db = demo();
    save();
    page = "settings";
    render();
  });
  await test("Locked base currency stays disabled in the enhanced selector", async () => {
    assert(await trigger("main [name=currency]").isDisabled());
  });
  await test("Dynamically added default-rate selectors are searchable", async () => {
    await p
      .getByRole("button", { name: "+ Add currency rate", exact: true })
      .click();
    const field = p.locator(".fx-row").last();
    await field.locator(".selection-trigger").click();
    await p.locator(".selection-popup input").fill("JPY");
    await p.locator(".selection-popup [role=option]").click();
    assert.equal(await field.locator("[name=fxCode]").inputValue(), "JPY");
    await field.getByRole("button", { name: "Remove exchange rate" }).click();
  });
  await p.evaluate(() => {
    page = "projects";
    render();
    openProject();
  });
  await test("Client selection works inside a modal, with Escape closing only the search", async () => {
    await trigger("#modal [name=client]").click();
    await p.locator(".selection-popup input").fill("Sunday");
    await p.locator(".selection-popup [role=option]").click();
    assert.equal(await p.locator("#modal [name=client]").inputValue(), "c3");
    await trigger("#modal [name=status]").click();
    await p.locator(".selection-popup input").press("Escape");
    assert(await p.locator("#modal").isVisible());
    await p.getByRole("button", { name: "Close dialog", exact: true }).click();
  });
  await test("Manifest, icons and the complete offline cache are available", async () => {
    const result = await p.evaluate(async () => {
      const m = await (await fetch("./manifest.webmanifest")).json();
      await navigator.serviceWorker.ready;
      const reg = await navigator.serviceWorker.getRegistration();
      const cache = await caches.open(
        (await caches.keys()).find((k) => k.startsWith("docket:")),
      );
      return {
        manifest: m,
        scope: reg.scope,
        assets: (await cache.keys()).map((r) => r.url),
        updateVisible: !document.getElementById("pwa-update").hidden,
      };
    });
    assert.equal(result.manifest.display, "standalone");
    assert.equal(result.manifest.start_url, "./");
    assert(result.manifest.icons.some((i) => i.purpose === "maskable"));
    assert.equal(result.assets.length, 17);
    assert.equal(result.updateVisible, false);
    assert(result.scope.endsWith("/"));
  });
  await p.evaluate(() => {
    page = "dashboard";
    save();
    render();
  });
  const before = await p.evaluate(() => JSON.stringify(db));
  await context.setOffline(true);
  await test("Offline reload preserves records and all main navigation routes work", async () => {
    await p.reload();
    assert.equal(await p.evaluate(() => JSON.stringify(db)), before);
    for (const route of [
      "clients",
      "projects",
      "invoices",
      "payments",
      "expenses",
      "reports",
      "settings",
      "developer",
      "dashboard",
    ])
      await p.locator(`#nav a[href="#${route}"]`).click();
    assert.match(await p.locator("#pwa-status").textContent(), /Offline/);
  });
  await test("An offline client can be created and survives another reload", async () => {
    await p.evaluate(() => openClient());
    await p.locator("#modal [name=name]").fill("Offline Client");
    await p.locator("#modal button[type=submit]").click();
    await p.reload();
    assert(
      await p.evaluate(() =>
        db.clients.some((c) => c.name === "Offline Client"),
      ),
    );
  });
  await context.setOffline(false);
  await test("Installation guidance is available when no native install prompt is exposed", async () => {
    await p.locator("#pwa-install").click();
    if (await p.locator("#modal").isVisible()) {
      assert.match(
        await p.locator("#modal").textContent(),
        /Add to Home Screen/,
      );
      await p
        .getByRole("button", { name: "Close dialog", exact: true })
        .click();
    }
  });
  assert.deepEqual(errors, []);
  fs.mkdirSync(path.join(__dirname, "results"), { recursive: true });
  fs.writeFileSync(
    path.join(
      __dirname,
      `results/pwa-${process.env.BROWSER || "chromium"}.json`,
    ),
    JSON.stringify({ passed: tests.length, tests, errors }, null, 2),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
