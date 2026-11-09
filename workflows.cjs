require("fs").mkdirSync(require("path").join(__dirname, "results"), {
  recursive: true,
});
const { chromium, firefox } = require("playwright");
const engine = process.env.BROWSER === "firefox" ? firefox : chromium;
const fs = require("fs");
const assert = require("assert/strict");
(async () => {
  const b = await engine.launch();
  const p = await b.newPage({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  p.setDefaultTimeout(8000);
  let errors = [],
    tests = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const test = async (n, f) => {
    await f();
    tests.push(n);
    console.log("PASS", n);
  };
  const nav = async (r) => {
    await p.locator(`#nav a[href="#${r}"]`).click();
    assert.equal(await p.evaluate(() => page), r);
  };
  const fill = (n, v) => p.locator(`#modal [name="${n}"]`).fill(v);
  const sel = (n, v) =>
    p.locator(`#modal [name="${n}"]`).selectOption(v, { force: true });
  const submit = () => p.locator("#modal button[type=submit]").click();
  const close = () =>
    p.getByRole("button", { name: "Close dialog", exact: true }).click();
  const accept = () =>
    p.locator("#confirm-modal [data-confirm-accept]").click();
  try {
    await p.goto(process.env.BASE_URL || "http://localhost:3000");
    await test("Fresh workspace has neutral tax defaults, global currency and region controls", async () => {
      assert.equal(await p.evaluate(() => db.version), 2);
      assert.equal(await p.evaluate(() => db.settings.gstRate), 0);
      assert.equal(await p.evaluate(() => db.settings.taxRate), 0);
      assert.equal(await p.evaluate(() => db.clients.length), 0);
      assert(
        (await p.locator("#setup-form [name=currency] option").count()) > 150,
      );
      assert(
        (await p.locator("#setup-form [name=country] option").count()) > 240,
      );
    });
    await p.locator("#setup-form [name=owner]").fill("Alex Morgan");
    await p.locator("#setup-form [name=name]").fill("Global Studio");
    await p
      .locator("#setup-form [name=country]")
      .selectOption("DE", { force: true });
    await p
      .locator("#setup-form [name=currency]")
      .selectOption("USD", { force: true });
    await p.locator("#setup-form [name=locale]").fill("de-DE");
    await p
      .locator("#setup-form [name=dateFormat]")
      .selectOption("dmy", { force: true });
    await p.getByRole("button", { name: "Continue", exact: true }).click();
    await p.locator("#setup-form [name=taxLabel]").fill("VAT");
    await p.locator("#setup-form [name=gstRate]").fill("20");
    await p.locator("#setup-form [name=taxRate]").fill("25");
    await p.getByRole("button", { name: "Create my workspace" }).click();
    await test("Regional onboarding saves locale, currency, dates and tax configuration", async () => {
      assert.equal(await p.evaluate(() => db.settings.currency), "USD");
      assert.equal(await p.evaluate(() => db.settings.country), "DE");
      assert.equal(await p.evaluate(() => fmtDate("2026-11-09")), "09/11/2026");
      assert.match(await p.evaluate(() => money(1234.56)), /1\.234,56/);
      assert(await p.evaluate(() => validBackup(db)));
      await p.reload();
      assert.equal(await p.evaluate(() => db.settings.taxLabel), "VAT");
    });
    await test("All navigation routes including Developer work", async () => {
      for (const r of [
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
        await nav(r);
      await nav("developer");
      assert.match(await p.locator("main").textContent(), /ClarCraft/);
      assert.match(await p.locator("footer").textContent(), /ClarCraft/);
    });
    await nav("settings");
    await test("Base currency can change before any records exist", async () => {
      await p
        .locator("main [name=currency]")
        .selectOption("EUR", { force: true });
      await p
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      assert.equal(await p.evaluate(() => db.settings.currency), "EUR");
      await p
        .locator("main [name=currency]")
        .selectOption("USD", { force: true });
      await p
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
    });
    await test("Default manual rates save and duplicate currencies are rejected", async () => {
      await p
        .getByRole("button", { name: "+ Add currency rate", exact: true })
        .click();
      await p
        .locator(".fx-row [name=fxCode]")
        .selectOption("EUR", { force: true });
      await p.locator(".fx-row [name=fxValue]").fill("1.1");
      await p
        .getByRole("button", { name: "Save exchange rates", exact: true })
        .click();
      assert.equal(await p.evaluate(() => db.settings.rates.EUR), 1.1);
      await p
        .getByRole("button", { name: "+ Add currency rate", exact: true })
        .click();
      await p
        .locator(".fx-row [name=fxCode]")
        .last()
        .selectOption("EUR", { force: true });
      await p.locator(".fx-row [name=fxValue]").last().fill("2");
      await p
        .getByRole("button", { name: "Save exchange rates", exact: true })
        .click();
      assert.match(await p.locator("#toast").textContent(), /unique/);
      await p
        .locator(".fx-row")
        .last()
        .getByRole("button", { name: "Remove exchange rate" })
        .click();
      await p
        .getByRole("button", { name: "Save exchange rates", exact: true })
        .click();
    });
    await nav("clients");
    await p.getByRole("button", { name: "Add client", exact: true }).click();
    await fill("name", "Lea Martin");
    await fill("company", "Atelier Europe");
    await fill("gstin", "EU-SAMPLE-123");
    await sel("status", "Won");
    await fill("followup", await p.evaluate(() => today()));
    await submit();
    let cid = await p.evaluate(() => db.clients[0].id);
    await test("Client CRM preserves generic international tax IDs and pipeline editing", async () => {
      assert.equal(
        await p.evaluate(() => db.clients[0].gstin),
        "EU-SAMPLE-123",
      );
      await p.getByRole("button", { name: "Pipeline", exact: true }).click();
      await p.locator(".board-card").click();
      await fill("notes", "International client");
      await submit();
      await p.getByRole("button", { name: "Table", exact: true }).click();
      await p.locator(".search").fill("Atelier");
      assert.equal(await p.locator("#main tbody tr").count(), 1);
    });
    await nav("projects");
    await p.getByRole("button", { name: "New project", exact: true }).click();
    await fill("name", "European brand system");
    await sel("client", cid);
    await sel("currency", "EUR");
    await fill("rate", "200");
    await fill("tasks", "Discovery\nDesign\nDelivery");
    await submit();
    let prid = await p.evaluate(() => db.projects[0].id);
    await test("Project currency and task checklist work independently of base currency", async () => {
      assert.equal(await p.evaluate(() => db.projects[0].currency), "EUR");
      assert.match(await p.locator(".project-card").textContent(), /€/);
      await p.locator(".task input").first().check();
      assert(await p.evaluate(() => db.projects[0].tasks[0].done));
    });
    await nav("invoices");
    await p.getByRole("button", { name: "New invoice", exact: true }).click();
    await sel("client", cid);
    await sel("project", prid);
    await sel("currency", "EUR");
    await p.locator('[aria-label="Item description"]').fill("Design services");
    await p.locator('[aria-label="Quantity"]').fill("2");
    await p.locator('[aria-label="Rate"]').fill("100");
    await test("Invoice currency selection uses default FX rate and previews native and base totals", async () => {
      assert.equal(
        await p.locator("#modal [name=exchangeRate]").inputValue(),
        "1.1",
      );
      assert.match(await p.locator("#draft-totals").textContent(), /€/);
      assert.match(await p.locator("#draft-totals").textContent(), /\$/);
      assert.match(await p.locator("#draft-totals").textContent(), /264/);
    });
    await submit();
    let iid = await p.evaluate(() => db.invoices[0].id);
    await test("EUR VAT invoice prints native amounts, tax label and regional dates", async () => {
      assert.deepEqual(
        await p.evaluate(() => {
          let i = db.invoices[0];
          return [sub(i), tax(i), total(i), toBase(total(i), i), i.taxLabel];
        }),
        [200, 40, 240, 264, "VAT"],
      );
      let t = await p.locator("#modal .invoice-paper").textContent();
      assert.match(t, /VAT \(20%\)/);
      assert.match(t, /All amounts in EUR/);
      assert(!t.includes("INR"));
      assert(!t.includes("GSTIN"));
      await p.evaluate(
        () => (window.print = () => (window.printCalled = true)),
      );
      await p.getByRole("button", { name: "Print / PDF", exact: true }).click();
      assert(await p.evaluate(() => window.printCalled));
      if (process.env.BROWSER !== "firefox")
        await p.pdf({
          path: require("path").join(__dirname, "results/workflow-invoice.pdf"),
          format: "A4",
          printBackground: true,
        });
    });
    await p.getByRole("button", { name: "Mark payment", exact: true }).click();
    await fill("amount", "100");
    await fill("exchangeRate", "1.2");
    await fill("reference", "INT-001");
    await submit();
    await test("Partial receipt uses its own saved FX rate; outstanding uses invoice rate", async () => {
      assert.deepEqual(
        await p.evaluate(() => [
          paid(db.invoices[0]),
          balance(db.invoices[0]),
          status(db.invoices[0]),
          income(month),
          owing(db.clients[0]),
          billed(db.clients[0]),
        ]),
        [100, 140, "Partial", 100, 154, 264],
      );
    });
    await nav("expenses");
    await p.getByRole("button", { name: "Add expense", exact: true }).click();
    await fill("vendor", "London Contractor");
    await sel("currency", "GBP");
    await test("Unconfigured foreign currency requires a manually supplied rate", async () => {
      assert.equal(
        await p.locator("#modal [name=exchangeRate]").inputValue(),
        "",
      );
      await fill("amount", "50");
      await fill("gst", "10");
      await submit();
      assert(await p.locator("#modal").isVisible());
      assert.equal(await p.evaluate(() => db.expenses.length), 0);
    });
    await fill("exchangeRate", "1.3");
    await submit();
    await test("GBP expense converts pre-tax amount to USD; profit and reserve are consistent", async () => {
      assert.deepEqual(
        await p.evaluate(() => [
          expense(month),
          income(month) - expense(month),
          ((income(month) - expense(month)) * db.settings.taxRate) / 100,
        ]),
        [65, 35, 8.75],
      );
      assert.match(await p.locator("#main tbody").textContent(), /£/);
      await nav("reports");
      assert.match(await p.locator("#main").textContent(), /USD/);
    });
    await nav("settings");
    await test("Base reporting currency is locked once records exist", async () => {
      assert(await p.locator("main [name=currency]").isDisabled());
      await p
        .locator("main [name=currency]")
        .evaluate((el) => (el.disabled = false));
      await p
        .locator("main [name=currency]")
        .selectOption("GBP", { force: true });
      await p
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      assert.equal(await p.evaluate(() => db.settings.currency), "USD");
      assert.match(await p.locator("#toast").textContent(), /locked/);
      await p.evaluate(() => render());
    });
    await test("Changing FX defaults and tax labels never changes historical records", async () => {
      await p.locator(".fx-row [name=fxValue]").fill("2");
      await p
        .getByRole("button", { name: "Save exchange rates", exact: true })
        .click();
      await p.locator("main [name=taxLabel]").fill("Sales tax");
      await p.locator("main [name=gstRate]").fill("5");
      await p
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      assert.deepEqual(
        await p.evaluate(() => [
          db.invoices[0].exchangeRate,
          db.invoices[0].taxLabel,
          db.invoices[0].gstRate,
          db.payments[0].exchangeRate,
          income(month),
        ]),
        [1.1, "VAT", 20, 1.2, 100],
      );
    });
    await nav("invoices");
    await p.locator("#main tbody button").first().click();
    await p.getByRole("button", { name: "Edit invoice", exact: true }).click();
    await sel("currency", "GBP");
    await fill("exchangeRate", "1.3");
    await submit();
    await test("Invoice currency cannot be changed after payments exist", async () => {
      assert.match(
        await p.locator("#toast").textContent(),
        /Cannot change currency/,
      );
      assert.equal(await p.evaluate(() => db.invoices[0].currency), "EUR");
      await close();
    });
    await nav("payments");
    await p
      .getByRole("button", { name: "Record payment", exact: true })
      .click();
    await fill("exchangeRate", "1.15");
    await submit();
    await test("Final foreign-currency payment closes invoice and totals cash at receipt rates", async () => {
      assert.equal(await p.evaluate(() => status(db.invoices[0])), "Paid");
      assert.equal(await p.evaluate(() => income(month)), 234.17);
      assert.equal(await p.evaluate(() => owing(db.clients[0])), 0);
    });
    await test("Removing a payment recalculates the original-currency balance", async () => {
      await p
        .locator("#main tbody tr")
        .filter({ hasText: "INT-001" })
        .getByRole("button", { name: "Remove", exact: true })
        .click();
      await accept();
      await p.waitForFunction(() => db.payments.length === 1);
      assert.equal(await p.evaluate(() => balance(db.invoices[0])), 100);
      assert.equal(await p.evaluate(() => status(db.invoices[0])), "Partial");
    });
    async function createSimple(currency, rate, amount) {
      await nav("invoices");
      await p.getByRole("button", { name: "New invoice", exact: true }).click();
      await sel("client", cid);
      await sel("currency", currency);
      await fill("exchangeRate", rate);
      await p
        .locator('[aria-label="Item description"]')
        .fill(currency + " services");
      await p.locator('[aria-label="Rate"]').fill(amount);
      await p.locator("#modal [name=gst]").uncheck();
      await submit();
    }
    await createSimple("JPY", "0.0067", "1000");
    await test("JPY respects zero-decimal totals and payment increments", async () => {
      assert.equal(await p.evaluate(() => currencyDigits("JPY")), 0);
      assert.equal(await p.evaluate(() => total(db.invoices.at(-1))), 1000);
      await p
        .getByRole("button", { name: "Mark payment", exact: true })
        .click();
      assert.equal(
        await p.locator("#modal [name=amount]").getAttribute("step"),
        "1",
      );
      await fill("amount", "1000");
      await submit();
      assert.equal(await p.evaluate(() => status(db.invoices.at(-1))), "Paid");
    });
    await createSimple("KWD", "3.25", "10.005");
    await p.getByRole("button", { name: "Mark payment", exact: true }).click();
    await fill("amount", "10.004");
    await submit();
    await test("KWD preserves a 0.001 remaining balance instead of marking it paid", async () => {
      assert.equal(await p.evaluate(() => balance(db.invoices.at(-1))), 0.001);
      assert.equal(
        await p.evaluate(() => status(db.invoices.at(-1))),
        "Partial",
      );
      assert(await p.evaluate(() => validBackup(db)));
      await p.evaluate(() => openPayment(db.invoices.at(-1).id));
      assert.equal(
        await p.locator("#modal [name=amount]").getAttribute("step"),
        "0.001",
      );
      await submit();
      assert.equal(await p.evaluate(() => status(db.invoices.at(-1))), "Paid");
    });
    await test("New single-currency USD records force exchange rate 1", async () => {
      await nav("expenses");
      await p.getByRole("button", { name: "Add expense", exact: true }).click();
      assert.equal(
        await p.locator("#modal [name=exchangeRate]").inputValue(),
        "1",
      );
      assert(
        (await p
          .locator("#modal [name=exchangeRate]")
          .getAttribute("readonly")) !== null,
      );
      await close();
    });
    await test("Locale formats and date preferences work without changing monetary data", async () => {
      await nav("settings");
      for (const [locale, format, expected] of [
        ["en-US", "mdy", "11/09/2026"],
        ["ja-JP", "iso", "2026-11-09"],
        ["fr-FR", "dmy", "09/11/2026"],
      ]) {
        await p.locator("main [name=locale]").fill(locale);
        await p
          .locator("main [name=dateFormat]")
          .selectOption(format, { force: true });
        await p
          .getByRole("button", { name: "Save changes", exact: true })
          .click();
        assert.equal(await p.evaluate(() => fmtDate("2026-11-09")), expected);
      }
      assert.equal(await p.evaluate(() => db.invoices[0].currency), "EUR");
    });
    await test("Invalid locale is rejected without saving settings", async () => {
      await p.locator("main [name=locale]").fill("invalid_locale!!!");
      await p
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      assert.equal(await p.evaluate(() => db.settings.locale), "fr-FR");
      await p.evaluate(() => render());
    });
    let backup;
    await test("Global JSON backup contains versioned currency, rate and region metadata", async () => {
      let wait = p.waitForEvent("download");
      await p
        .getByRole("button", { name: "Export backup", exact: true })
        .click();
      let d = await wait;
      backup = fs.readFileSync(await d.path(), "utf8");
      assert.equal(JSON.parse(backup).version, 2);
      assert(await p.evaluate((d) => validBackup(JSON.parse(d)), backup));
      assert.equal(JSON.parse(backup).invoices[0].exchangeRate, 1.1);
    });
    await test("Global export → clear → restore → reload is an exact data round trip", async () => {
      await p
        .getByRole("button", { name: "Clear business records", exact: true })
        .click();
      await accept();
      await p.waitForFunction(() => db.clients.length === 0);
      await p.locator("#restore-file").setInputFiles({
        name: "global.json",
        mimeType: "application/json",
        buffer: Buffer.from(backup),
      });
      await accept();
      await p.waitForFunction(() => db.clients.length === 1);
      await p.reload();
      assert.deepEqual(await p.evaluate(() => db), JSON.parse(backup));
    });
    await test("CSV exports retain currencies, FX rates and converted reporting totals", async () => {
      for (const r of ["invoices", "expenses"]) {
        await nav(r);
        let wait = p.waitForEvent("download");
        await p
          .getByRole("button", { name: "Export CSV", exact: true })
          .click();
        let d = await wait;
        let text = fs.readFileSync(await d.path(), "utf8");
        assert(text.includes("Currency"));
        assert(text.includes("Exchange rate to USD"));
        assert(text.includes(r === "invoices" ? "EUR" : "GBP"));
        assert(text.includes("USD"));
      }
    });
    await test("Missing FX metadata and invalid base-currency rates are rejected", async () => {
      for (const mutate of [
        (d) => delete d.invoices[0].exchangeRate,
        (d) => (d.settings.rates.USD = 2),
        (d) => (d.expenses[0].exchangeRate = 0),
        (d) => (d.payments[0].exchangeRate = -1),
      ]) {
        let d = JSON.parse(backup);
        mutate(d);
        assert.equal(await p.evaluate((x) => validBackup(x), d), false);
      }
    });
    await test("Custom two-part taxes keep their labels and combined total", async () => {
      await nav("invoices");
      await p.getByRole("button", { name: "New invoice", exact: true }).click();
      await sel("client", cid);
      await p
        .locator('[aria-label="Item description"]')
        .fill("Split tax example");
      await p.locator('[aria-label="Rate"]').fill("100");
      await p.locator("#modal [name=gst]").check();
      await fill("gstRate", "10");
      await sel("gstType", "split");
      await fill("taxPartA", "Federal tax");
      await fill("taxPartB", "Local tax");
      await submit();
      let text = await p.locator("#modal .invoice-paper").textContent();
      assert.match(text, /Federal tax \(5%\)/);
      assert.match(text, /Local tax \(5%\)/);
      assert.equal(await p.evaluate(() => total(db.invoices.at(-1))), 110);
      await close();
    });
    await test("Mobile navigation includes Developer and all pages fit", async () => {
      await p.setViewportSize({ width: 390, height: 844 });
      for (const r of [
        "clients",
        "projects",
        "invoices",
        "payments",
        "expenses",
        "reports",
        "settings",
        "developer",
        "dashboard",
      ]) {
        await p.locator("#menu").click();
        await nav(r);
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
      }
      await p.setViewportSize({ width: 1440, height: 1000 });
    });
    await nav("settings");
    let legacy = fs.readFileSync(
      require("path").join(__dirname, "fixtures/legacy-v12.json"),
      "utf8",
    );
    await test("Legacy INR backup explicitly migrates, preserving original GST and balances", async () => {
      await p.locator("#restore-file").setInputFiles({
        name: "legacy.json",
        mimeType: "application/json",
        buffer: Buffer.from(legacy),
      });
      await accept();
      await p.waitForFunction(() => db.settings.currency === "INR");
      assert.equal(await p.evaluate(() => db.version), 2);
      assert.equal(await p.evaluate(() => db.settings.locale), "en-IN");
      assert.equal(await p.evaluate(() => db.invoices[0].taxPartA), "CGST");
      assert.deepEqual(
        await p.evaluate(() =>
          db.invoices
            .slice(0, 3)
            .map((i) => [total(i), paid(i), balance(i), status(i)]),
        ),
        [
          [53100, 0, 53100, "Overdue"],
          [76700, 30000, 46700, "Partial"],
          [35400, 35400, 0, "Paid"],
        ],
      );
      assert(await p.evaluate(() => validBackup(db)));
      await p.reload();
      assert.equal(await p.evaluate(() => db.settings.currency), "INR");
    });
    await test("Legacy subtotal rounding is preserved for fractional line items", async () => {
      let d = JSON.parse(legacy);
      d.invoices[0].items = [
        { description: "A", qty: 1, rate: 0.005 },
        { description: "B", qty: 1, rate: 0.005 },
      ];
      assert(await p.evaluate((x) => validBackup(x), d));
      assert.equal(
        await p.evaluate((x) => total(normaliseWorkspace(x).invoices[0]), d),
        0.01,
      );
    });
    await test("International sample data is optional, internally valid and mixed-currency", async () => {
      await p
        .getByRole("button", { name: "Load demo data (optional)", exact: true })
        .click();
      await accept();
      await p.waitForFunction(() => db.settings.name === "Northline Studio");
      assert(await p.evaluate(() => validBackup(db)));
      assert.deepEqual(
        await p.evaluate(() =>
          [...new Set(db.invoices.map((i) => i.currency))].sort(),
        ),
        ["EUR", "GBP", "USD"],
      );
      assert.equal(
        await p.evaluate(
          () => db.invoices.filter((i) => status(i) === "Overdue").length,
        ),
        1,
      );
      assert.equal(
        await p.evaluate(
          () => db.invoices.filter((i) => status(i) === "Partial").length,
        ),
        1,
      );
    });
    await nav("developer");
    await p.screenshot({
      path: require("path").join(__dirname, "results/developer.png"),
      fullPage: true,
    });
    await nav("settings");
    await p.screenshot({
      path: require("path").join(__dirname, "results/settings.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    tests.push("No uncaught JavaScript errors in global end-to-end session");
    fs.writeFileSync(
      require("path").join(
        __dirname,
        `results/workflows-${process.env.BROWSER || "chromium"}.json`,
      ),
      JSON.stringify({ passed: tests.length, tests, errors }, null, 2),
    );
    console.log("TOTAL", tests.length);
  } catch (e) {
    console.error("FAILED", e);
    await p.screenshot({
      path: require("path").join(__dirname, "results/workflow-failure.png"),
      fullPage: true,
    });
    fs.writeFileSync(
      require("path").join(
        __dirname,
        `results/workflows-${process.env.BROWSER || "chromium"}.json`,
      ),
      JSON.stringify(
        { passed: tests.length, tests, errors, failure: String(e) },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } finally {
    await b.close();
  }
})();
