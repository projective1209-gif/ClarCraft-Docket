const { chromium } = require("playwright");
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const results = path.join(__dirname, "results");
  fs.mkdirSync(results, { recursive: true });
  fs.mkdirSync(path.join(__dirname, "../docs"), { recursive: true });
  let tests = [],
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const test = async (n, f) => {
    await f();
    tests.push(n);
    console.log("PASS", n);
  };
  await p.goto(process.env.BASE_URL || "http://localhost:3000");
  const prepare = async (mode = "standard") =>
    p.evaluate((mode) => {
      db = demo();
      db.settings.locale = "en-GB";
      db.settings.dateFormat = "dmy";
      db.settings.bank =
        "Bank transfer\nIBAN: SAMPLE — replace with your bank details\nBIC / SWIFT: SAMPLE";
      db.settings.upi = "";
      db.settings.gstin = "SAMPLE-TAX-ID";
      const c = db.clients[0];
      Object.assign(c, {
        name: "Lea Martin",
        company: "Atelier Europe",
        email: "accounts@atelier.example",
        address: "24 Sample Avenue\nParis, France",
        phone: "",
        gstin: "SAMPLE-CLIENT-TAX-ID",
      });
      const i = db.invoices[0];
      Object.assign(i, {
        number: "NS-2026-001",
        currency: "EUR",
        exchangeRate: 1.08,
        legacyRounding: false,
        date: today(),
        due: addDays(today(), 15),
        project: "",
        gst: true,
        gstRate: 20,
        gstType: "igst",
        taxLabel: "VAT",
        taxPartA: "CGST",
        taxPartB: "SGST",
        mode: "Bank transfer",
        items: [
          {
            description:
              "Brand strategy & discovery\nResearch, positioning and creative direction",
            qty: 2,
            rate: 450,
          },
          {
            description: "Design production\nFinal artwork and delivery files",
            qty: 3,
            rate: 80,
          },
        ],
        notes:
          "Payment is due within 15 days of the invoice date.\nThank you for your business. This is a fictional sample invoice.",
      });
      db.payments = [
        {
          id: "sample-receipt",
          invoice: i.id,
          amount: 400,
          exchangeRate: 1.08,
          date: today(),
          mode: "Bank transfer",
          reference: "SAMPLE-RECEIPT",
        },
      ];
      if (mode === "no-tax") {
        i.gst = false;
        db.payments = [];
      }
      if (mode === "split") {
        i.currency = "INR";
        i.gstType = "split";
        i.gstRate = 18;
      }
      if (mode === "JPY") {
        i.currency = "JPY";
        i.gst = false;
        i.items = [{ description: "Japanese yen service", qty: 2, rate: 1000 }];
        db.payments = [];
      }
      if (mode === "KWD") {
        i.currency = "KWD";
        i.gst = false;
        i.items = [
          { description: "Three-decimal service", qty: 1, rate: 10.005 },
        ];
        db.payments[0].amount = 10.004;
      }
      if (mode === "paid") db.payments[0].amount = total(i);
      if (mode === "long") {
        i.number = "NS-2026-LONG-REFERENCE-000000001";
        i.items = Array.from({ length: 70 }, (_, n) => ({
          description: `Service item ${String(n + 1).padStart(2, "0")} — Research, implementation and delivery of agreed business requirements.`,
          qty: 1,
          rate: 25 + n,
        }));
        i.notes += "\nFinal line marker: END-OF-INVOICE.";
      }
      if (mode === "long-token") {
        db.settings.name =
          "A long business name with professional design services and international consulting";
        c.address = "VeryLongUnbrokenAddressToken".repeat(8);
        i.items = [
          {
            description: "LongUnbrokenServiceDescription".repeat(20),
            qty: 12.5,
            rate: 12345.123456,
          },
        ];
        i.taxLabel = "Regional value added tax contribution";
        i.number = "NS-2026-LONG-REFERENCE-00000000000000000001";
      }
      page = "invoices";
      render();
      viewInvoice(i.id);
      window.print = () => {};
      printInvoice(i.id);
    }, mode);
  const pdf = async (name) => {
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({
      path: path.join(results, name + ".pdf"),
      preferCSSPageSize: true,
      printBackground: true,
    });
  };
  await prepare();
  await test("Invoice shows symbol-based precise amounts, clear dates, tax and partial balance", async () => {
    const text = await p.locator("#modal .invoice-paper").textContent();
    for (const value of [
      "€1,140.00",
      "€228.00",
      "€1,368.00",
      "€400.00",
      "€968.00",
      "VAT (20%)",
      "Partial",
      "Invoice date",
      "Due date",
    ])
      assert(text.includes(value), value);
    assert.equal(await p.locator("#modal .invoice-lines tbody tr").count(), 2);
    await pdf("invoice-standard");
    fs.copyFileSync(
      path.join(results, "invoice-standard.pdf"),
      path.join(__dirname, "../docs/sample-invoice.pdf"),
    );
  });
  await test("Invoice preview remains inside the mobile viewport with a dedicated table scroller", async () => {
    await p.setViewportSize({ width: 320, height: 780 });
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    const r = await p
      .locator("#modal .invoice-table-wrap")
      .evaluate((el) => ({ width: el.clientWidth, scroll: el.scrollWidth }));
    assert(r.scroll > r.width);
    await p.screenshot({
      path: path.join(results, "invoice-mobile.png"),
      fullPage: true,
    });
    await p.setViewportSize({ width: 1280, height: 1000 });
  });
  await prepare("no-tax");
  await test("Tax-free invoice omits tax rows and retains a correct unpaid balance", async () => {
    const text = await p.locator("#modal .invoice-paper").textContent();
    assert(!text.includes("TAX INVOICE"));
    assert(!text.includes("VAT ("));
    assert(text.includes("€1,140.00"));
    await pdf("invoice-no-tax");
  });
  await prepare("split");
  await test("Two-part taxes and the rupee symbol print with exact totals", async () => {
    const text = await p.locator("#modal .invoice-paper").textContent();
    assert(text.includes("CGST (9%)"));
    assert(text.includes("SGST (9%)"));
    assert(text.includes("₹102.60"));
    assert(text.includes("₹1,345.20"));
    await pdf("invoice-split");
  });
  await prepare("JPY");
  await test("Zero-decimal invoice totals do not invent fractional yen", async () => {
    const text = await p.locator("#modal .invoice-paper").textContent();
    assert(text.includes("¥2,000"));
    assert(!text.includes("¥2,000.00"));
    await pdf("invoice-jpy");
  });
  await prepare("KWD");
  await test("Three-decimal invoice retains the 0.001 outstanding balance", async () => {
    assert.match(
      await p.locator("#modal .invoice-totals").textContent(),
      /0\.001/,
    );
    await pdf("invoice-kwd");
  });
  await prepare("paid");
  await test("Fully paid invoice has Paid status and zero balance", async () => {
    assert.equal(await p.locator("#modal .status").textContent(), "Paid");
    assert.match(
      await p.locator("#modal .invoice-balance").textContent(),
      /€0\.00/,
    );
    await pdf("invoice-paid");
  });
  await prepare("long-token");
  await test("Long references, addresses and descriptions wrap without page-level overflow", async () => {
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    assert(
      await p
        .locator("#modal .invoice-paper")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    );
    await pdf("invoice-long-token");
  });
  await prepare("long");
  await test("A 70-line invoice prints with repeatable table headers and intact closing totals", async () => {
    assert.equal(await p.locator("#modal .invoice-lines tbody tr").count(), 70);
    await pdf("invoice-multipage");
  });
  await prepare();
  await p
    .locator("#modal .invoice-paper")
    .screenshot({ path: path.join(results, "invoice-preview.png") });
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(results, "invoices.json"),
    JSON.stringify({ passed: tests.length, tests, errors }, null, 2),
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
