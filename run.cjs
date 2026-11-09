const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
fs.mkdirSync(path.join(__dirname, "results"), { recursive: true });
const suites = [
  ["workflows", "chromium"],
  ["precision", "chromium"],
  ["data", "chromium"],
  ["interactions", "chromium"],
  ["pwa", "chromium"],
  ["updates", "chromium"],
  ["invoices", "chromium"],
  ["layout", "chromium"],
  ["workflows", "firefox"],
  ["pwa", "firefox"],
  ["layout", "firefox"],
];
for (const [suite, browser] of suites) {
  console.log(`\n${suite} · ${browser}`);
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, suite + ".cjs")],
    { stdio: "inherit", env: { ...process.env, BROWSER: browser } },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log("\nAll Docket regression suites passed.");
