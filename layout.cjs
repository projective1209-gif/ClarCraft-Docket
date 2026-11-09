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
  let errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(process.env.BASE_URL || "http://localhost:3000");
  let checks = 0;
  const issues = [];
  const measure = async (label) => {
    let result = await p.evaluate(() => {
      const root = document.documentElement;
      const overflow = root.scrollWidth > innerWidth + 1;
      const dialogs = [...document.querySelectorAll("dialog[open]")].map(
        (x) => ({
          x: x.getBoundingClientRect().x,
          r: x.getBoundingClientRect().right,
          w: x.clientWidth,
          scroll: x.scrollWidth,
        }),
      );
      return { overflow, width: innerWidth, doc: root.scrollWidth, dialogs };
    });
    checks++;
    if (
      result.overflow ||
      result.dialogs.some(
        (d) => d.x < 0 || d.r > result.width + 1 || d.scroll > d.w + 1,
      )
    ) {
      issues.push({ label, ...result });
      console.log("LAYOUT ISSUE", label, result);
    }
  };
  for (const width of [
    320, 360, 390, 414, 620, 768, 820, 1024, 1280, 1440, 1920,
  ]) {
    await p.setViewportSize({ width, height: 900 });
    await p.evaluate(() => {
      db = blankWorkspace();
      setupStep = 1;
      onboardingDraft = { ...db.settings };
      render();
    });
    await measure("onboarding 1 " + width);
    await p.evaluate(() => {
      setupStep = 2;
      render();
    });
    await measure("onboarding 2 " + width);
    await p.evaluate(() => {
      db = demo();
      db.onboarded = true;
      db.settings.name = "A deliberately long business name for layout testing";
      db.settings.owner = "Aarohi Shah";
      render();
    });
    for (const route of [
      "dashboard",
      "clients",
      "projects",
      "invoices",
      "payments",
      "expenses",
      "reports",
      "settings",
      "guide",
      "developer",
    ]) {
      await p.evaluate((r) => navigate(r), route);
      await measure(route + " " + width);
    }
    await p.evaluate(() => {
      clientView = "board";
      navigate("clients");
    });
    await measure("pipeline " + width);
    await p.evaluate(() => (clientView = "table"));
    for (const action of [
      "openClient()",
      "openProject()",
      "openExpense()",
      "openInvoice()",
      "openPayment()",
      'viewInvoice("i1")',
    ]) {
      await p.evaluate((a) => eval(a), action);
      await measure(action + " " + width);
      await p.evaluate(() => closeModal());
    }
    await p.evaluate(() => {
      db = blankWorkspace();
      db.onboarded = true;
      db.settings.name = "Test";
      render();
      navigate("dashboard");
    });
    await measure("empty dashboard " + width);
    console.log("Checked width", width);
  }
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.evaluate(() => {
    db = demo();
    db.onboarded = true;
    navigate("dashboard");
  });
  await p.screenshot({
    path: require("path").join(__dirname, "results/desktop.png"),
    fullPage: true,
    animations: "disabled",
  });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.screenshot({
    path: require("path").join(__dirname, "results/mobile.png"),
    fullPage: true,
    animations: "disabled",
  });
  await p.evaluate(() => {
    db = blankWorkspace();
    setupStep = 1;
    render();
  });
  await p.screenshot({
    path: require("path").join(__dirname, "results/setup-mobile.png"),
    fullPage: true,
    animations: "disabled",
  });
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({
    path: require("path").join(__dirname, "results/setup.png"),
    fullPage: true,
    animations: "disabled",
  });
  fs.writeFileSync(
    require("path").join(
      __dirname,
      `results/layout-${process.env.BROWSER || "chromium"}.json`,
    ),
    JSON.stringify(
      {
        checks,
        issues,
        errors,
        widths: [320, 360, 390, 414, 620, 768, 820, 1024, 1280, 1440, 1920],
      },
      null,
      2,
    ),
  );
  await b.close();
  assert.deepEqual(issues, []);
  assert.deepEqual(errors, []);
  console.log("PASS", checks, "layout measurements");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
