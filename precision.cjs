require("fs").mkdirSync(require("path").join(__dirname, "results"), {
  recursive: true,
});
const { chromium, firefox } = require("playwright");
const engine = process.env.BROWSER === "firefox" ? firefox : chromium;
const fs = require("fs");
const assert = require("assert/strict");
(async () => {
  const b = await engine.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  let tests = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const test = async (n, f) => {
    await f();
    tests.push(n);
    console.log("PASS", n);
  };
  await p.goto(process.env.BASE_URL || "http://localhost:3000");
  await test("Currency rounding handles decimal half boundaries and multiplication residue", async () => {
    assert.deepEqual(
      await p.evaluate(() => [
        roundMoney(10.075, "USD"),
        roundMoney(3 * 0.705, "USD"),
        roundMoney(100.0005, "KWD"),
        roundMoney(10.5, "JPY"),
        roundMoney(-10.075, "USD"),
      ]),
      [10.08, 2.12, 100.001, 11, -10.08],
    );
  });
  await test("Unit price formatting retains all six permitted decimals", async () => {
    assert.match(
      await p.evaluate(() => unitMoney(0.123456, "USD")),
      /0\.123456/,
    );
  });
  await p.evaluate(() => {
    db = demo();
    db.invoices = [
      {
        ...db.invoices[0],
        id: "round-invoice",
        currency: "EUR",
        exchangeRate: 0.5,
        gst: false,
        items: [{ description: "Rounding test", qty: 1, rate: 0.02 }],
      },
    ];
    db.payments = [
      {
        id: "round-p1",
        invoice: "round-invoice",
        amount: 0.01,
        exchangeRate: 0.5,
        date: today(),
        mode: "Bank transfer",
        reference: "",
      },
      {
        id: "round-p2",
        invoice: "round-invoice",
        amount: 0.01,
        exchangeRate: 0.5,
        date: today(),
        mode: "Bank transfer",
        reference: "",
      },
    ];
    db.expenses = [
      {
        ...db.expenses[0],
        id: "round-e1",
        date: today(),
        currency: "EUR",
        exchangeRate: 0.5,
        amount: 0.01,
        gst: 0,
      },
      {
        ...db.expenses[0],
        id: "round-e2",
        date: today(),
        currency: "EUR",
        exchangeRate: 0.5,
        amount: 0.01,
        gst: 0,
      },
    ];
  });
  await test("Income and expenses aggregate rounded transaction conversions consistently", async () => {
    assert.deepEqual(
      await p.evaluate(() => [
        income(month),
        expense(month),
        balance(db.invoices[0]),
        validBackup(db),
      ]),
      [0.02, 0.02, 0, true],
    );
  });
  const old = JSON.parse(
    fs.readFileSync(
      require("path").join(__dirname, "fixtures/legacy-v12.json"),
    ),
  );
  old.invoices[0].gst = false;
  old.invoices[0].items = [
    { description: "Fractional legacy rate", qty: 1, rate: 10.075 },
  ];
  await p.evaluate((d) => {
    db = normaliseWorkspace(d);
    save();
    page = "invoices";
    render();
  }, old);
  await test("Legacy decimal boundaries preserve original totals, not new rounding", async () => {
    assert.equal(await p.evaluate(() => total(db.invoices[0])), 10.07);
    assert(await p.evaluate(() => validBackup(db)));
  });
  await p.evaluate(() => openInvoice(db.invoices[0].id));
  await test("Legacy invoice edit preview agrees with the preserved saved total", async () => {
    assert.match(await p.locator("#draft-totals").textContent(), /10\.07/);
    await p.locator("#modal button[type=submit]").click();
    assert.equal(await p.evaluate(() => total(db.invoices[0])), 10.07);
  });
  await p.evaluate(() => openInvoice(db.invoices[0].id));
  await p
    .locator("#modal [name=currency]")
    .selectOption("JPY", { force: true });
  await p.locator("#modal [name=exchangeRate]").fill("0.56");
  await p.locator("#modal button[type=submit]").click();
  await test("Explicitly changing a migrated invoice currency applies the new currency precision", async () => {
    assert.deepEqual(
      await p.evaluate(() => [
        db.invoices[0].currency,
        db.invoices[0].legacyRounding,
        total(db.invoices[0]),
        validBackup(db),
      ]),
      ["JPY", false, 10, true],
    );
  });
  await p.evaluate(() => {
    closeModal();
    db = demo();
    db.settings.locale = "ar-AE";
    db.settings.taxLabel = "ضريبة القيمة المضافة";
    page = "settings";
    render();
  });
  await p.setViewportSize({ width: 320, height: 750 });
  await test("Arabic number locale and Unicode tax labels remain valid on narrow screens", async () => {
    assert(await p.evaluate(() => validBackup(db)));
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    assert(await p.evaluate(() => money(1234.56).length > 0));
  });
  await test("Invalid currency codes, negative FX rates and non-finite converted totals are rejected", async () => {
    for (const type of ["currency", "negative", "overflow"])
      assert.equal(
        await p.evaluate((type) => {
          let d = JSON.parse(JSON.stringify(db));
          if (type === "currency") d.invoices[0].currency = "XYZ";
          if (type === "negative") d.payments[0].exchangeRate = -1;
          if (type === "overflow") {
            d.expenses[0].amount = 1e308;
            d.expenses[0].exchangeRate = 1000000;
          }
          return validBackup(d);
        }, type),
        false,
      );
  });
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    require("path").join(__dirname, "results/precision.json"),
    JSON.stringify({ passed: tests.length, tests, errors }, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
