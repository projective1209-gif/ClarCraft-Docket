require("fs").mkdirSync(require("path").join(__dirname, "results"), {
  recursive: true,
});
const { chromium, firefox } = require("playwright");
const engine = process.env.BROWSER === "firefox" ? firefox : chromium;
const fs = require("fs");
const assert = require("assert/strict");
function parseCSV(s) {
  s = s.replace(/^\uFEFF/, "");
  let rows = [],
    row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') {
      if (quoted && s[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" && !quoted) {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell.replace(/\r$/, ""));
  rows.push(row);
  return rows;
}
(async () => {
  const b = await engine.launch();
  const p = await b.newPage();
  const results = [];
  const test = async (n, f) => {
    await f();
    results.push(n);
    console.log("PASS", n);
  };
  const accept = async () => {
    await p.locator("#confirm-modal [data-confirm-accept]").click();
  };
  const upload = async (data, name = "backup.json") =>
    p.locator("#restore-file").setInputFiles({
      name,
      mimeType: "application/json",
      buffer: Buffer.from(
        typeof data === "string" ? data : JSON.stringify(data),
      ),
    });
  await p.goto(process.env.BASE_URL || "http://localhost:3000");
  await p.evaluate(() => {
    db = demo();
    db.onboarded = true;
    db.settings.name = "આરોહી — Studio";
    db.settings.address = "Surat, Gujarat\nSecond line";
    db.settings.logo =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=";
    db.clients[0].notes = 'Quotes "double", commas, and\na second line';
    save();
    navigate("settings");
  });
  let raw;
  await test("JSON export preserves complete profile, logo, Unicode and all records", async () => {
    let wait = p.waitForEvent("download");
    await p.getByRole("button", { name: "Export backup", exact: true }).click();
    const d = await wait;
    assert(d.suggestedFilename().startsWith("docket-backup-"));
    raw = fs.readFileSync(await d.path(), "utf8");
    assert.deepEqual(JSON.parse(raw), await p.evaluate(() => db));
  });
  await test("JSON import preview identifies the file and record counts", async () => {
    await upload(raw, "full-workspace.json");
    await p.locator("#confirm-modal").waitFor({ state: "visible" });
    let text = await p.locator("#confirm-modal").textContent();
    assert(text.includes("full-workspace.json"));
    assert(text.includes("5 clients"));
    assert(text.includes("10 invoices"));
    await p
      .locator("#confirm-modal")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
  });
  await test("Full export → clear → import → reload is an exact round trip", async () => {
    await p
      .getByRole("button", { name: "Clear business records", exact: true })
      .click();
    await accept();
    await p.waitForFunction(() => db.clients.length === 0);
    await upload(raw);
    await accept();
    await p.waitForFunction(() => db.clients.length === 5);
    await p.reload();
    assert.deepEqual(await p.evaluate(() => db), JSON.parse(raw));
  });
  await test("Failed import persistence leaves memory and stored records unchanged", async () => {
    const original = await p.evaluate(() => ({
      memory: JSON.stringify(db),
      stored: localStorage.getItem(KEY),
    }));
    let incoming = JSON.parse(raw);
    incoming.settings.name = "Should not replace";
    await p.evaluate(() => {
      window.originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        throw new DOMException("Test quota", "QuotaExceededError");
      };
    });
    await upload(incoming);
    await accept();
    await p.waitForFunction(() =>
      document
        .querySelector("#toast")
        .textContent.includes("could not be saved"),
    );
    assert.deepEqual(
      await p.evaluate(() => ({
        memory: JSON.stringify(db),
        stored: localStorage.getItem(KEY),
      })),
      original,
    );
    await p.evaluate(
      () => (Storage.prototype.setItem = window.originalSetItem),
    );
  });
  await test("Malformed, duplicate-ID, dangling-reference and overpaid backups are rejected", async () => {
    let variants = [];
    variants.push("{bad-json");
    let d = JSON.parse(raw);
    d.clients[1].id = d.clients[0].id;
    variants.push(d);
    d = JSON.parse(raw);
    d.invoices[0].client = "missing";
    variants.push(d);
    d = JSON.parse(raw);
    d.payments[0].amount = 9999999;
    variants.push(d);
    d = JSON.parse(raw);
    d.invoices[0].project = "pr2";
    variants.push(d);
    for (const x of variants) {
      await upload(x);
      await p.waitForFunction(() =>
        document.querySelector("#toast").textContent.includes("Invalid"),
      );
      assert.equal(await p.evaluate(() => db.clients.length), 5);
      assert(!(await p.locator("#confirm-modal").isVisible()));
      await p.evaluate(
        () => (document.querySelector("#toast").textContent = ""),
      );
    }
  });
  await test("Oversized backup rejected before replacing records", async () => {
    await p.locator("#restore-file").setInputFiles({
      name: "too-large.json",
      mimeType: "application/json",
      buffer: Buffer.alloc(8 * 1024 * 1024 + 1, 32),
    });
    await p.waitForFunction(() =>
      document.querySelector("#toast").textContent.includes("Invalid"),
    );
    assert.equal(await p.evaluate(() => db.clients.length), 5);
  });
  await test("CSV export handles Unicode, quotes, commas, line breaks and formula-like values", async () => {
    await p.evaluate(() => {
      db.expenses[0].vendor = "=SUM(1,2)";
      db.expenses[0].notes = 'Quoted "note", ગુજરાતી\nSecond line';
      navigate("expenses");
    });
    const wait = p.waitForEvent("download");
    await p.getByRole("button", { name: "Export CSV", exact: true }).click();
    const d = await wait;
    const csv = fs.readFileSync(await d.path(), "utf8");
    assert.equal(csv.charCodeAt(0), 0xfeff);
    let rows = parseCSV(csv);
    assert(rows.every((r) => r.length === 12));
    const row = rows.find((r) => r[2].includes("SUM"));
    assert.equal(row[2], "'=SUM(1,2)");
    assert.equal(row[11], 'Quoted "note", ગુજરાતી\nSecond line');
    assert.equal(rows.length, await p.evaluate(() => db.expenses.length + 1));
  });
  await test("Invoice CSV exports all invoices even with a restrictive status filter", async () => {
    await p.evaluate(() => navigate("invoices"));
    await p.locator(".toolbar select").selectOption("Overdue", { force: true });
    assert.equal(await p.locator("#main tbody tr").count(), 1);
    const wait = p.waitForEvent("download");
    await p.getByRole("button", { name: "Export CSV", exact: true }).click();
    let d = await wait;
    const rows = parseCSV(fs.readFileSync(await d.path(), "utf8"));
    assert.equal(rows.length, 11);
    assert(rows.every((r) => r.length === 14));
    assert(rows.some((r) => r[11] === "Partial"));
    assert(rows.some((r) => r[11] === "Paid"));
  });
  await test("Restoring the same filename twice is supported", async () => {
    await p.evaluate(() => navigate("settings"));
    for (let k = 0; k < 2; k++) {
      await upload(raw, "same.json");
      await accept();
      await p.waitForFunction(() =>
        document
          .querySelector("#toast")
          .textContent.includes("restored successfully"),
      );
      assert.equal(await p.locator("#restore-file").inputValue(), "");
      await p.evaluate(
        () => (document.querySelector("#toast").textContent = ""),
      );
    }
  });
  fs.writeFileSync(
    require("path").join(__dirname, "results/data.json"),
    JSON.stringify({ passed: results.length, tests: results }, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
