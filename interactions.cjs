require("fs").mkdirSync(require("path").join(__dirname, "results"), {
  recursive: true,
});
const { chromium, firefox } = require("playwright");
const engine = process.env.BROWSER === "firefox" ? firefox : chromium;
const assert = require("assert/strict");
const fs = require("fs");
(async () => {
  const b = await engine.launch();
  const p = await b.newPage();
  const results = [];
  const test = async (name, f) => {
    await f();
    results.push(name);
    console.log("PASS", name);
  };
  await p.goto(process.env.BASE_URL || "http://localhost:3000");
  await p.evaluate(() => {
    db = demo();
    db.onboarded = true;
    save();
    navigate("settings");
  });
  await test("Destructive confirmation: Cancel and Escape preserve records", async () => {
    await p
      .getByRole("button", { name: "Clear business records", exact: true })
      .click();
    await p
      .locator("#confirm-modal")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    assert.equal(await p.evaluate(() => db.clients.length), 5);
    await p
      .getByRole("button", {
        name: "Start fresh with profile setup",
        exact: true,
      })
      .click();
    await p.keyboard.press("Escape");
    assert.equal(await p.evaluate(() => db.clients.length), 5);
  });
  await test("Invalid logo files are rejected without changing profile", async () => {
    await p.locator('input[type=file][accept^="image"]').setInputFiles({
      name: "unsafe.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
    assert.match(await p.locator("#toast").textContent(), /PNG, JPG or WebP/);
    assert.equal(await p.evaluate(() => db.settings.logo), "");
  });
  await test("Restore cancellation preserves existing records", async () => {
    let backup = await p.evaluate(() => {
      const d = blankWorkspace();
      d.settings.name = "Other";
      return JSON.stringify(d);
    });
    await p.locator("#restore-file").setInputFiles({
      name: "other.json",
      mimeType: "application/json",
      buffer: Buffer.from(backup),
    });
    await p
      .locator("#confirm-modal")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    assert.equal(await p.evaluate(() => db.settings.name), "Northline Studio");
  });
  await test("Invoice search and every status filter", async () => {
    await p.locator('#nav a[href="#invoices"]').click();
    await p.locator(".search").fill("NS-1001");
    assert.equal(await p.locator("#main tbody tr").count(), 1);
    await p.locator(".search").fill("");
    for (const [status, count] of [
      ["Overdue", 1],
      ["Partial", 1],
      ["Pending", 1],
      ["Paid", 7],
    ]) {
      await p.locator(".toolbar select").selectOption(status, { force: true });
      assert.equal(await p.locator("#main tbody tr").count(), count);
    }
    await p.locator(".toolbar select").selectOption("All", { force: true });
  });
  await test("Due date before issue date is rejected", async () => {
    await p.getByRole("button", { name: "New invoice", exact: true }).click();
    await p.locator("#modal [name=client]").selectOption("c1", { force: true });
    await p.locator("#modal [name=due]").fill("2020-01-01");
    await p.locator('[aria-label="Item description"]').fill("Test");
    await p.locator('[aria-label="Rate"]').fill("100");
    await p.locator("#modal button[type=submit]").click();
    assert.match(await p.locator("#toast").textContent(), /Due date cannot/);
  });
  await test("Invoice project/client mismatch is rejected", async () => {
    await p
      .locator("#modal [name=due]")
      .fill(await p.evaluate(() => addDays(today(), 15)));
    await p
      .locator("#modal [name=project]")
      .selectOption("pr2", { force: true });
    await p.locator("#modal button[type=submit]").click();
    assert.match(await p.locator("#toast").textContent(), /different client/);
    await p.getByRole("button", { name: "Close dialog", exact: true }).click();
  });
  await test("Payment invoice selector updates amount and enforces max", async () => {
    await p.locator('#nav a[href="#payments"]').click();
    await p
      .getByRole("button", { name: "Record payment", exact: true })
      .click();
    await p
      .locator("#modal [name=invoice]")
      .selectOption("i2", { force: true });
    assert.equal(await p.locator("#modal [name=amount]").inputValue(), "2000");
    assert.equal(
      await p.locator("#modal [name=amount]").getAttribute("max"),
      "2000",
    );
    await p.getByRole("button", { name: "Close dialog", exact: true }).click();
  });
  await test("Reports invoice and expense export buttons download files", async () => {
    await p.locator('#nav a[href="#reports"]').click();
    for (const name of ["Invoices CSV", "Expenses CSV"]) {
      const wait = p.waitForEvent("download");
      await p.getByRole("button", { name, exact: true }).click();
      const download = await wait;
      assert(download.suggestedFilename().endsWith(".csv"));
    }
  });
  await test("Malformed calendar dates and unsafe project statuses are rejected in backups", async () => {
    assert(
      await p.evaluate(() => {
        let d = demo();
        d.clients[0].followup = "2026-02-31";
        return !validBackup(d);
      }),
    );
    assert(
      await p.evaluate(() => {
        let d = demo();
        d.projects[0].status = '\" onclick=alert(1)';
        return !validBackup(d);
      }),
    );
  });
  await test("Enter-key form submission creates exactly one client", async () => {
    await p.locator('#nav a[href="#clients"]').click();
    await p.getByRole("button", { name: "Add client", exact: true }).click();
    await p.locator("#modal [name=name]").fill("Keyboard User");
    await p.locator("#modal [name=name]").press("Enter");
    await p.waitForTimeout(80);
    assert.equal(
      await p.evaluate(
        () => db.clients.filter((c) => c.name === "Keyboard User").length,
      ),
      1,
    );
  });
  await test("Short mobile sidebar scrolls to settings and help", async () => {
    await p.setViewportSize({ width: 390, height: 500 });
    await p.locator("#menu").click();
    await p.locator('#nav a[href="#settings"]').click();
    assert.equal(await p.evaluate(() => page), "settings");
    await p.locator("#menu").click();
    await p.locator(".help-link").click();
    assert.equal(await p.evaluate(() => page), "guide");
  });
  fs.writeFileSync(
    require("path").join(__dirname, "results/interactions.json"),
    JSON.stringify({ passed: results.length, tests: results }, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
