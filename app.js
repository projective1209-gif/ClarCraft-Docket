"use strict";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const icons = {
  developer: '<path d="m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18"/>',
  dashboard:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  clients:
    '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
  projects:
    '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v3h4v-3"/>',
  invoices:
    '<path d="M6 3h9l4 4v14l-4-2-3 2-3-2-3 2zM14 3v5h5M9 12h7M9 16h5"/>',
  payments:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  expenses: '<path d="M7 3h10v18l-3-2-2 2-2-2-3 2zM10 7h4M10 11h4M10 15h3"/>',
  reports: '<path d="M4 3v18h17M8 17v-5M13 17V7M18 17V3"/>',
  settings:
    '<path d="M19.39 8.94 L19.76 10.06 L21.85 10.26 L21.85 13.74 L19.76 13.94 L19.39 15.06 L18.86 16.12 L20.19 17.74 L17.74 20.19 L16.12 18.86 L15.06 19.39 L13.94 19.76 L13.74 21.85 L10.26 21.85 L10.06 19.76 L8.94 19.39 L7.88 18.86 L6.26 20.19 L3.81 17.74 L5.14 16.12 L4.61 15.06 L4.24 13.94 L2.15 13.74 L2.15 10.26 L4.24 10.06 L4.61 8.94 L5.14 7.88 L3.81 6.26 L6.26 3.81 L7.88 5.14 L8.94 4.61 L10.06 4.24 L10.26 2.15 L13.74 2.15 L13.94 4.24 L15.06 4.61 L16.12 5.14 L17.74 3.81 L20.19 6.26 L18.86 7.88 Z"/><circle cx="12" cy="12" r="3.25"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
  up: '<path d="m6 16 12-9M7 7h11v11"/>',
  down: '<path d="m6 7 12 9M7 16h11V5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
};
const icon = (n, size = 17) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.invoices}</svg>`;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const today = () => localISO(new Date());
function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const addDays = (d, n) => {
  let a = new Date(d + "T12:00:00");
  a.setDate(a.getDate() + n);
  return localISO(a);
};
// Regional preferences and explicit, offline currency conversion.
const CURRENCIES =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : [
        "USD",
        "EUR",
        "GBP",
        "INR",
        "JPY",
        "CNY",
        "CAD",
        "AUD",
        "NZD",
        "CHF",
        "SGD",
        "HKD",
        "AED",
        "SAR",
        "BRL",
        "MXN",
        "ZAR",
        "KRW",
        "KWD",
        "BHD",
        "OMR",
        "SEK",
        "NOK",
        "DKK",
        "PLN",
        "TRY",
        "IDR",
        "MYR",
        "THB",
        "PHP",
        "VND",
        "NGN",
        "KES",
      ];
const COUNTRIES =
  "AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW".split(
    " ",
  );
const COMMON_LOCALES = [
  "en-US",
  "en-GB",
  "en-CA",
  "en-AU",
  "en-NZ",
  "en-IN",
  "en-SG",
  "en-ZA",
  "fr-FR",
  "fr-CA",
  "de-DE",
  "de-CH",
  "es-ES",
  "es-MX",
  "pt-BR",
  "pt-PT",
  "it-IT",
  "nl-NL",
  "sv-SE",
  "nb-NO",
  "da-DK",
  "pl-PL",
  "tr-TR",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "ar-AE",
  "ar-SA",
  "he-IL",
  "hi-IN",
  "id-ID",
  "ms-MY",
  "th-TH",
  "vi-VN",
  "uk-UA",
];
const PAYMENT_MODES = [
  "Bank transfer",
  "Card",
  "Cash",
  "PayPal",
  "Digital wallet",
  "UPI",
  "Other",
  "Bank",
];
const DATE_FORMATS = [
  ["regional", "Regional format"],
  ["dmy", "DD/MM/YYYY"],
  ["mdy", "MM/DD/YYYY"],
  ["iso", "YYYY-MM-DD"],
];
function currencySymbol(code) {
  return (
    new Intl.NumberFormat(db?.settings?.locale || "en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value || code
  );
}
function currencyOptions() {
  const names = new Intl.DisplayNames(["en"], { type: "currency" });
  return [...CURRENCIES]
    .sort()
    .map((c) => [c, `${currencySymbol(c)} ${names.of(c) || c} (${c})`]);
}
function countryOptions() {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return [
    ["", "Select country / region"],
    ...COUNTRIES.map((c) => [c, names.of(c) || c]).sort((a, b) =>
      a[1].localeCompare(b[1]),
    ),
  ];
}
function regionalDefaults() {
  let locale = navigator.language || "en-US";
  try {
    locale = Intl.getCanonicalLocales(locale)[0];
  } catch {
    locale = "en-US";
  }
  return {
    country: "",
    locale,
    currency: "USD",
    dateFormat: "regional",
    taxLabel: "Tax",
    taxMode: "igst",
    taxPartA: "Tax component 1",
    taxPartB: "Tax component 2",
    rates: { USD: 1 },
    ratesDate: "",
  };
}
const currencyDigits = (code) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency: code || "INR",
  }).resolvedOptions().maximumFractionDigits;
const unitMoney = (n, currency) =>
  new Intl.NumberFormat(db.settings.locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: currencyDigits(currency),
    maximumFractionDigits: 6,
  }).format(n);
const currencyUnit = (code) => Math.pow(10, -currencyDigits(code));
const recordCurrency = (r) => r?.currency || "INR";
const roundMoney = (n, code) => {
  const factor = 10 ** currencyDigits(code);
  const scaled = Math.abs(n) * factor;
  return (Math.sign(n) * Math.round(scaled + Number.EPSILON * scaled)) / factor;
};
const baseRound = (n) => roundMoney(n, db.settings.currency);
const toBase = (n, r) => baseRound(n * (r?.exchangeRate ?? 1));
function validLocale(locale) {
  try {
    return (
      typeof locale === "string" &&
      locale.length <= 80 &&
      Intl.getCanonicalLocales(locale).length === 1
    );
  } catch {
    return false;
  }
}
function validFX(n) {
  return typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 1e9;
}
function hasRecords() {
  return ["clients", "projects", "invoices", "payments", "expenses"].some(
    (k) => db[k].length > 0,
  );
}
function normaliseWorkspace(data) {
  const d = JSON.parse(JSON.stringify(data));
  if (d.version === 1) {
    Object.assign(d.settings, {
      country: "IN",
      locale: "en-IN",
      currency: "INR",
      dateFormat: "regional",
      taxLabel: "GST",
      taxMode: "split",
      taxPartA: "CGST",
      taxPartB: "SGST",
      rates: { INR: 1 },
      ratesDate: "",
    });
    for (const i of d.invoices)
      Object.assign(i, {
        currency: "INR",
        exchangeRate: 1,
        legacyRounding: true,
        taxLabel: i.gstType === "split" ? "GST" : "IGST",
        taxPartA: "CGST",
        taxPartB: "SGST",
      });
    for (const e of d.expenses)
      Object.assign(e, { currency: "INR", exchangeRate: 1 });
    for (const p of d.payments) p.exchangeRate = 1;
    for (const p of d.projects) p.currency = "INR";
    d.version = 2;
  }
  if (d.onboarded === undefined) d.onboarded = Boolean(d.settings.name.trim());
  return d;
}
function localeField(s) {
  return `<label class="field">Number / date locale<input name="locale" value="${esc(s.locale)}" list="locale-options" required placeholder="e.g. en-US, fr-FR, ja-JP"><datalist id="locale-options">${COMMON_LOCALES.map((l) => `<option value="${l}"></option>`).join("")}</datalist><small>Any valid locale tag. Interface language remains English.</small></label>`;
}
function regionalFields(s, locked = false) {
  return `${selectField("Country / region", "country", countryOptions(), s.country)}${localeField(s)}${selectField("Base reporting currency", "currency", currencyOptions(), s.currency)}${selectField("Date display", "dateFormat", DATE_FORMATS, s.dateFormat)}<p class="report-note field full">${locked ? "The base currency is locked while records exist to prevent relabelling historical amounts. You can still choose a different currency on each invoice and expense." : "Choose your reporting currency before adding records. Each invoice and expense can use its own currency with a saved manual exchange rate."} Region changes do not automatically apply tax rules.</p>`;
}
function taxSettingsFields(s) {
  return `${field("Tax label (VAT, GST, sales tax…)", "taxLabel", s.taxLabel, "text", false, 'required maxlength="40"')}${field("Default tax rate (%)", "gstRate", s.gstRate, "number", false, 'required min="0" max="100" step="0.01"')}${selectField(
    "Tax presentation",
    "taxMode",
    [
      ["igst", "Single tax"],
      ["split", "Two equal components"],
    ],
    s.taxMode,
  )}${field("Tax reserve (% of profit)", "taxRate", s.taxRate, "number", false, 'required min="0" max="100" step="0.01"')}${field("First component label", "taxPartA", s.taxPartA, "text", false, 'required maxlength="40"')}${field("Second component label", "taxPartB", s.taxPartB, "text", false, 'required maxlength="40"')}<p class="report-note field full">Tax is off by default when the rate is 0%. Split tax divides the total rate equally. Confirm local invoice and tax requirements with your accountant. No country-specific tax filing or compliance is automated.</p>`;
}
function fxFields(r = {}) {
  const c = r.currency || db.settings.currency,
    rate =
      r.exchangeRate ??
      (c === db.settings.currency ? 1 : (db.settings.rates[c] ?? ""));
  return `${selectField("Transaction currency", "currency", currencyOptions(), c)}${field(`Exchange rate to ${db.settings.currency}`, "exchangeRate", rate, "number", false, 'required min="0.00000001" max="1000000000" step="any"')}<p class="report-note field full" data-fx-hint>1 ${esc(c)} = entered rate in ${esc(db.settings.currency)}. This rate is saved with the record; later default-rate changes do not rewrite it.</p>`;
}
function bindFX(form, callback) {
  const currency = form.elements.currency,
    rate = form.elements.exchangeRate;
  if (!currency || !rate) return;
  const update = (changed = false) => {
    const c = currency.value;
    if (c === db.settings.currency) {
      rate.value = 1;
      rate.readOnly = true;
    } else {
      rate.readOnly = false;
      if (changed) rate.value = db.settings.rates[c] ?? "";
    }
    const hint = form.querySelector("[data-fx-hint]");
    if (hint)
      hint.textContent = `1 ${c} = entered rate in ${db.settings.currency}. Saved with this record. Enter the rate manually; no online rate is fetched. Changing currency does not convert entered amounts.`;
    form.querySelectorAll("[data-money-input]").forEach((el) => {
      el.step = String(currencyUnit(c));
      el.min = el.name === "gst" ? "0" : String(currencyUnit(c));
    });
    if (callback) callback();
  };
  currency.addEventListener("change", () => update(true));
  rate.addEventListener("input", () => callback?.());
  update(false);
}
function readFX(form) {
  const currency = form.elements.currency.value,
    exchangeRate = Number(form.elements.exchangeRate.value);
  if (
    !CURRENCIES.includes(currency) ||
    !validFX(exchangeRate) ||
    (currency === db.settings.currency && exchangeRate !== 1)
  ) {
    toast(
      "Choose a valid currency and a positive exchange rate. Base-currency records must use 1.",
    );
    return null;
  }
  return { currency, exchangeRate };
}
function rateRows(rates) {
  return Object.entries(rates)
    .filter(([c]) => c !== db.settings.currency)
    .map(([c, r]) => rateRow(c, r))
    .join("");
}
function rateRow(c = "", r = "") {
  return `<div class="fx-row">${selectField("Currency", "fxCode", [["", "Select currency"], ...currencyOptions().filter(([v]) => v !== db.settings.currency)], c)}${field(`1 unit = ${db.settings.currency}`, "fxValue", r, "number", false, 'required min="0.00000001" max="1000000000" step="any"')}<button type="button" class="btn small" aria-label="Remove exchange rate" onclick="this.closest('.fx-row').remove()">Remove</button></div>`;
}
function saveRates(e) {
  e.preventDefault();
  const rates = { [db.settings.currency]: 1 };
  for (const row of e.target.querySelectorAll(".fx-row")) {
    const c = row.querySelector("[name=fxCode]").value,
      r = Number(row.querySelector("[name=fxValue]").value);
    if (!CURRENCIES.includes(c) || !validFX(r) || rates[c] !== undefined)
      return toast(
        "Choose unique currencies and enter a positive rate for each.",
      );
    rates[c] = r;
  }
  db.settings.rates = rates;
  db.settings.ratesDate = e.target.elements.ratesDate.value;
  if (save())
    toast("Default exchange rates saved. Existing records are unchanged.");
  render();
}
function validateRegion(s) {
  if (
    !CURRENCIES.includes(s.currency) ||
    !validLocale(s.locale) ||
    !(s.country === "" || COUNTRIES.includes(s.country)) ||
    !DATE_FORMATS.some(([v]) => v === s.dateFormat)
  )
    return false;
  return (
    ["taxLabel", "taxPartA", "taxPartB"].every(
      (k) =>
        typeof s[k] === "string" && s[k].trim().length > 0 && s[k].length <= 40,
    ) && ["igst", "split"].includes(s.taxMode)
  );
}
function currencyTaxNote() {
  return `Reports in ${esc(db.settings.currency)} · manual exchange rates · tax excluded`;
}
function developerPage() {
  return (
    heading("Developer", "The team behind Docket.", "", "ABOUT DOCKET") +
    `<div class="settings-grid"><section class="panel form-panel developer-card"><div class="developer-monogram">CC</div><div class="eyebrow">DEVELOPED BY</div><h2 class="developer-name">ClarCraft</h2><p>Docket is developed by ClarCraft. A focused workspace for managing clients, projects, invoices and business finances.</p><div class="developer-facts"><div><span>Product</span><strong>Docket</strong></div><div><span>Version</span><strong>1.4 · Installable workspace</strong></div><div><span>Architecture</span><strong>Static HTML, CSS & JavaScript</strong></div><div><span>Data</span><strong>Single-user · browser-local storage</strong></div></div></section><div class="stack"><section class="panel form-panel"><h2>Designed for independent businesses</h2><p>Choose regional formats, invoice currencies and configurable tax labels. Manual exchange rates keep your reports consistent without requiring an external service.</p><a class="text-link" href="#settings">Regional and currency settings ↗</a></section><section class="panel form-panel"><h2>Documentation and data</h2><p>Docket is not a tax-filing, payment-processing or cloud-storage service. Review the setup guide and export regular backups.</p><div class="backup-actions">${btn("Export backup", "backup()", true, "download")}<a class="btn" href="#guide">Setup guide & FAQ</a></div></section></div></div>`
  );
}

const fmtDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const style = db.settings.dateFormat;
  if (style === "iso") return d;
  if (style === "dmy") return `${day}/${m}/${y}`;
  if (style === "mdy") return `${m}/${day}/${y}`;
  return new Date(d + "T12:00:00").toLocaleDateString(db.settings.locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const money = (n, currency = db.settings.currency) =>
  new Intl.NumberFormat(db.settings.locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: currencyDigits(currency),
  }).format(Number(n) || 0);
const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
// Retain the original storage key so renaming the app never erases an existing workspace.
const KEY = "hisaabdesk.v1";
let storeError = false;
function demo() {
  const d = blankWorkspace(),
    now = today(),
    m = now.slice(0, 7),
    day = (n) =>
      `${m}-${String(Math.min(n, new Date().getDate())).padStart(2, "0")}`;
  d.onboarded = true;
  Object.assign(d.settings, {
    name: "Northline Studio",
    owner: "Alex Morgan",
    email: "hello@northline.example",
    address: "100 Sample Street\nNew York, NY 10001",
    country: "US",
    locale: "en-US",
    currency: "USD",
    dateFormat: "regional",
    gstin: "",
    upi: "payments@northline.example",
    bank: "Sample payment details — replace before use.\nBank transfer / IBAN / SWIFT as applicable.",
    prefix: "NS-",
    gstRate: 0,
    taxRate: 25,
    rates: { USD: 1, EUR: 1.08, GBP: 1.26 },
    ratesDate: now,
  });
  d.clients = [
    {
      id: "c1",
      name: "Jamie Lee",
      company: "Fieldwork Co.",
      email: "jamie@fieldwork.example",
      phone: "",
      gstin: "",
      address: "New York, United States",
      source: "Referral",
      status: "Won",
      followup: addDays(now, 1),
      notes: "Review the next brand phase.",
    },
    {
      id: "c2",
      name: "Sam Taylor",
      company: "Niva Living",
      email: "sam@niva.example",
      phone: "",
      gstin: "GB-SAMPLE",
      address: "London, United Kingdom",
      source: "Website",
      status: "Won",
      followup: addDays(now, 3),
      notes: "Website handover.",
    },
    {
      id: "c3",
      name: "Lea Martin",
      company: "Sunday Coffee",
      email: "lea@sunday.example",
      phone: "",
      gstin: "EU-SAMPLE",
      address: "Berlin, Germany",
      source: "Referral",
      status: "Won",
      followup: "",
      notes: "Monthly creative services.",
    },
    {
      id: "c4",
      name: "Noah Chen",
      company: "Studio Form",
      email: "noah@form.example",
      phone: "",
      gstin: "",
      address: "Singapore",
      source: "Website",
      status: "Proposal",
      followup: now,
      notes: "Follow up on the proposal.",
    },
    {
      id: "c5",
      name: "Amira Hassan",
      company: "Mitti & Co.",
      email: "amira@mitti.example",
      phone: "",
      gstin: "",
      address: "Dubai, United Arab Emirates",
      source: "Referral",
      status: "Lead",
      followup: addDays(now, 5),
      notes: "Arrange an introductory call.",
    },
  ];
  d.projects = [
    {
      id: "pr1",
      name: "Brand identity",
      client: "c1",
      type: "Fixed",
      rate: 4500,
      currency: "USD",
      start: addDays(now, -32),
      deadline: addDays(now, 10),
      status: "Active",
      tasks: [
        { text: "Discovery", done: true },
        { text: "Visual direction", done: true },
        { text: "Final delivery", done: false },
      ],
      notes: "Brand identity and packaging.",
    },
    {
      id: "pr2",
      name: "Website redesign",
      client: "c2",
      type: "Fixed",
      rate: 2500,
      currency: "GBP",
      start: addDays(now, -45),
      deadline: addDays(now, 5),
      status: "Active",
      tasks: [
        { text: "Wireframes", done: true },
        { text: "Design", done: true },
        { text: "Handover", done: false },
      ],
      notes: "Website design.",
    },
    {
      id: "pr3",
      name: "Creative retainer",
      client: "c3",
      type: "Retainer",
      rate: 1800,
      currency: "EUR",
      start: addDays(now, -65),
      deadline: addDays(now, 20),
      status: "Active",
      tasks: [
        { text: "Content plan", done: true },
        { text: "Creative production", done: false },
      ],
      notes: "Monthly creative support.",
    },
  ];
  const add = (
    id,
    c,
    amount,
    currency,
    rate,
    date,
    due,
    project,
    label,
    taxRate = 0,
  ) =>
    d.invoices.push({
      id,
      number: "NS-" + (1001 + d.invoices.length),
      date,
      due,
      client: c,
      project,
      items: [{ description: label, qty: 1, rate: amount }],
      gst: taxRate > 0,
      gstRate: taxRate,
      gstType: "igst",
      taxLabel: taxRate ? "VAT" : "Tax",
      taxPartA: "Tax component 1",
      taxPartB: "Tax component 2",
      currency,
      exchangeRate: rate,
      mode: "Bank transfer",
      notes:
        "Thank you for your business. Sample tax and FX rates are illustrative, not current rates.",
    });
  add(
    "i1",
    "c1",
    4500,
    "USD",
    1,
    addDays(now, -32),
    addDays(now, -12),
    "pr1",
    "Brand identity",
  );
  add(
    "i2",
    "c2",
    2500,
    "GBP",
    1.26,
    day(2),
    addDays(now, 8),
    "pr2",
    "Website design",
    20,
  );
  add(
    "i3",
    "c3",
    1800,
    "EUR",
    1.08,
    day(1),
    addDays(now, 12),
    "pr3",
    "Creative retainer",
    19,
  );
  add(
    "i4",
    "c1",
    4200,
    "USD",
    1,
    day(1),
    addDays(now, 4),
    "pr1",
    "Brand strategy",
  );
  add(
    "i5",
    "c3",
    1200,
    "EUR",
    1.08,
    day(3),
    addDays(now, 15),
    "pr3",
    "Creative production",
    19,
  );
  d.payments = [
    {
      id: "pa1",
      date: day(4),
      invoice: "i2",
      amount: 1000,
      exchangeRate: 1.26,
      mode: "Bank transfer",
      reference: "SAMPLE-001",
    },
    {
      id: "pa2",
      date: day(2),
      invoice: "i3",
      amount: 2142,
      exchangeRate: 1.08,
      mode: "Card",
      reference: "SAMPLE-002",
    },
    {
      id: "pa3",
      date: day(3),
      invoice: "i4",
      amount: 4200,
      exchangeRate: 1,
      mode: "Bank transfer",
      reference: "SAMPLE-003",
    },
  ];
  d.expenses = [
    {
      id: "e1",
      date: day(1),
      category: "Software",
      vendor: "Design tools",
      amount: 29,
      gst: 0,
      currency: "USD",
      exchangeRate: 1,
      client: "",
      project: "",
      notes: "Monthly subscription",
    },
    {
      id: "e2",
      date: day(2),
      category: "Workspace",
      vendor: "The Workroom",
      amount: 300,
      gst: 0,
      currency: "USD",
      exchangeRate: 1,
      client: "",
      project: "",
      notes: "Coworking desk",
    },
    {
      id: "e3",
      date: day(3),
      category: "Contractors",
      vendor: "Freelance development",
      amount: 400,
      gst: 80,
      currency: "GBP",
      exchangeRate: 1.26,
      client: "c2",
      project: "pr2",
      notes: "Development support",
    },
    {
      id: "e4",
      date: day(4),
      category: "Travel",
      vendor: "Local transport",
      amount: 120,
      gst: 0,
      currency: "EUR",
      exchangeRate: 1.08,
      client: "c3",
      project: "pr3",
      notes: "Workshop travel",
    },
  ];
  for (let k = 5; k >= 1; k--) {
    let dt = new Date();
    dt.setDate(1);
    dt.setMonth(dt.getMonth() - k);
    let ds = localISO(dt),
      base = [5000, 6200, 5800, 8000, 7000][5 - k],
      id = "ih" + k;
    add(id, "c1", base, "USD", 1, ds, addDays(ds, 14), "", "Design services");
    d.payments.push({
      id: "ph" + k,
      date: addDays(ds, 5),
      invoice: id,
      amount: base,
      exchangeRate: 1,
      mode: "Bank transfer",
      reference: "SAMPLE-HISTORY",
    });
    d.expenses.push({
      id: "eh" + k,
      date: addDays(ds, 3),
      category: "Other",
      vendor: "Operating costs",
      amount: [1200, 1800, 1400, 2100, 1700][5 - k],
      gst: 0,
      currency: "USD",
      exchangeRate: 1,
      client: "",
      project: "",
      notes: "Sample history",
    });
  }
  return d;
}
function blankWorkspace() {
  return {
    version: 2,
    onboarded: false,
    settings: {
      name: "",
      owner: "",
      email: "",
      address: "",
      gstin: "",
      upi: "",
      bank: "",
      prefix: "INV-",
      gstRate: 0,
      terms: 15,
      taxRate: 0,
      logo: "",
      ...regionalDefaults(),
    },
    clients: [],
    projects: [],
    invoices: [],
    payments: [],
    expenses: [],
  };
}
let db = blankWorkspace(),
  unreadableBackup = "";
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    $(".save-status").innerHTML = "<i></i> Saved locally";
    return true;
  } catch {
    $(".save-status").textContent = "Not saved — export a backup";
    toast("Storage unavailable or full. Export a backup before closing.");
    return false;
  }
}

let page = "dashboard",
  month = today().slice(0, 7),
  clientView = "table",
  query = "",
  filter = "All";
const client = (id) => db.clients.find((c) => c.id === id);
const project = (id) => db.projects.find((p) => p.id === id);
const invoice = (id) => db.invoices.find((i) => i.id === id);
const legacyInvoice = (i) =>
  !i.currency || (i.legacyRounding && i.currency === "INR");
const sub = (i) =>
  legacyInvoice(i)
    ? round(i.items.reduce((s, x) => s + x.qty * x.rate, 0))
    : roundMoney(
        i.items.reduce(
          (s, x) => s + roundMoney(x.qty * x.rate, recordCurrency(i)),
          0,
        ),
        recordCurrency(i),
      );
const tax = (i) =>
  !i.gst
    ? 0
    : legacyInvoice(i)
      ? round((sub(i) * i.gstRate) / 100)
      : roundMoney((sub(i) * i.gstRate) / 100, recordCurrency(i));
const total = (i) =>
  legacyInvoice(i)
    ? round(sub(i) + tax(i))
    : roundMoney(sub(i) + tax(i), recordCurrency(i));
const paid = (i) =>
  roundMoney(
    db.payments
      .filter((p) => p.invoice === i.id)
      .reduce((s, p) => s + p.amount, 0),
    recordCurrency(i),
  );
const balance = (i) =>
  Math.max(0, roundMoney(total(i) - paid(i), recordCurrency(i)));
const status = (i) =>
  balance(i) === 0
    ? "Paid"
    : i.due < today()
      ? "Overdue"
      : paid(i) > 0
        ? "Partial"
        : "Pending";
const billed = (c) =>
  baseRound(
    db.invoices
      .filter((i) => i.client === c.id)
      .reduce((s, i) => s + toBase(total(i), i), 0),
  );
const owing = (c) =>
  baseRound(
    db.invoices
      .filter((i) => i.client === c.id)
      .reduce((s, i) => s + toBase(balance(i), i), 0),
  );
const income = (m) =>
  baseRound(
    db.payments
      .filter((p) => p.date.startsWith(m))
      .reduce((s, p) => {
        const i = invoice(p.invoice);
        return (
          s +
          baseRound(
            (p.amount / (i?.gst ? 1 + i.gstRate / 100 : 1)) * p.exchangeRate,
          )
        );
      }, 0),
  );
const expense = (m) =>
  baseRound(
    db.expenses
      .filter((e) => e.date.startsWith(m))
      .reduce((s, e) => s + toBase(e.amount, e), 0),
  );
const badge = (s) =>
  `<span class="status ${s
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-]/g, "")}">${esc(s)}</span>`;
const initials = (s) =>
  (s || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((a) => a[0])
    .join("")
    .toUpperCase();
function clientCell(c, idx = 0) {
  return c
    ? `<div class="client-cell"><span class="client-icon tone-${idx % 4}">${esc(initials(c.company || c.name))}</span><div><strong>${esc(c.company || c.name)}</strong><small>${esc(c.name)}</small></div></div>`
    : "Deleted client";
}
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => $("#toast").classList.remove("show"),
    3500,
  );
}
const btn = (text, action, primary = false, ic = "") =>
  `<button class="btn ${primary ? "primary" : ""}" onclick="${action}">${ic ? icon(ic, 14) : ""}${text}</button>`;
function heading(title, desc, actions = "", eyebrow = "WORKSPACE OVERVIEW") {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${desc}</p></div><div class="heading-actions">${actions}</div></div>`;
}
const monthControl = () =>
  `<label class="date-control">${icon("calendar", 14)}<input type="month" aria-label="Reporting month" title="Reporting month (YYYY-MM)" placeholder="YYYY-MM" min="1900-01" max="9999-12" value="${month}" oninput="setReportingMonth(this)" onchange="setReportingMonth(this)"></label>`;
function setReportingMonth(input) {
  const value = input.value;
  const valid =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) >= 1900;
  input.setCustomValidity(
    valid
      ? ""
      : "Enter a valid reporting month in YYYY-MM format (1900 or later).",
  );
  input.setAttribute("aria-invalid", String(!valid));
  if (valid && value !== month) {
    month = value;
    render();
  }
}
const metric = (label, value, foot, ic, highlight = false) =>
  `<div class="metric ${highlight ? "highlight" : ""}"><div class="metric-label">${label}${icon(ic, 16)}</div><div class="metric-value">${money(value)}</div><div class="metric-foot">${foot}</div></div>`;
function panelHead(title, subtext = "", link = "", route = "") {
  return `<div class="panel-head"><div><h2>${title}</h2>${subtext ? `<p>${subtext}</p>` : ""}</div>${link ? `<a class="text-link" href="#${route}">${link} ↗</a>` : ""}</div>`;
}
function chart() {
  let end = new Date(month + "-01T12:00:00"),
    months = [];
  for (let k = 5; k >= 0; k--) {
    let d = new Date(end);
    d.setMonth(d.getMonth() - k);
    months.push(localISO(d).slice(0, 7));
  }
  let max = Math.max(
    10000,
    ...months.map((m) => Math.max(income(m), expense(m))),
  );
  max = Math.ceil(max / 25000) * 25000;
  return `<div class="panel-head"><div><h2>Income and expenses</h2><p>Monthly cash flow in ${esc(db.settings.currency)} · last six months.</p></div><div class="chart-legend"><span>Income</span><span>Expenses</span></div></div><div class="chart"><div class="chart-axis">${[1, 0.75, 0.5, 0.25, 0].map((n) => `<span>${new Intl.NumberFormat(db.settings.locale, { notation: "compact", maximumFractionDigits: 1 }).format(max * n)}</span>`).join("")}</div><div class="chart-plot">${months.map((m) => `<div class="bar-group"><div class="bar" style="height:${(income(m) / max) * 100}%;display:${income(m) > 0 ? "block" : "none"}" title="${esc(m)} income: ${money(income(m))}"></div><div class="bar expense" style="height:${(expense(m) / max) * 100}%;display:${expense(m) > 0 ? "block" : "none"}" title="Expenses: ${money(expense(m))}"></div><span class="bar-label">${new Date(m + "-01T12:00:00").toLocaleDateString(db.settings.locale, { month: "short" })}</span></div>`).join("")}</div></div><div class="chart-summary"><span>Cash basis · excluding tax</span><span>6-month net <strong>${money(months.reduce((s, m) => s + income(m) - expense(m), 0))}</strong></span></div>`;
}
function invoiceTable(list, compact = false) {
  if (!list.length) return '<div class="empty">No invoices to display.</div>';
  return `<div class="table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"><table><thead><tr><th>Invoice / Client</th>${!compact ? "<th>Issued</th>" : ""}<th>Due date</th><th>${compact ? "Balance" : "Total"}</th><th>Status</th>${!compact ? "<th>Balance</th>" : ""}<th></th></tr></thead><tbody>${list.map((i, n) => `<tr><td><a href="#" onclick="viewInvoice('${i.id}');return false"><strong>${esc(i.number)}</strong><small>${esc(client(i.client)?.company || client(i.client)?.name)}</small></a></td>${!compact ? `<td>${fmtDate(i.date)}</td>` : ""}<td>${fmtDate(i.due)}${status(i) === "Overdue" ? `<small class="text-danger">${Math.floor((new Date(today()) - new Date(i.due)) / 86400000)} days overdue</small>` : ""}</td><td class="amount" title="${esc(i.currency)}">${money(compact ? balance(i) : total(i), i.currency)}</td><td>${badge(status(i))}</td>${!compact ? `<td title="${esc(i.currency)}">${money(balance(i), i.currency)}</td>` : ""}<td><button class="text-link" onclick="viewInvoice('${i.id}')" aria-label="View ${esc(i.number)}">${icon("arrow", 15)}</button></td></tr>`).join("")}</tbody></table></div>`;
}
function dashboard() {
  let inc = income(month),
    exp = expense(month),
    profit = inc - exp,
    out = db.invoices.reduce((s, i) => s + toBase(balance(i), i), 0),
    over = db.invoices.filter((i) => status(i) === "Overdue"),
    due = db.clients
      .filter(
        (c) =>
          c.followup &&
          c.followup >= today() &&
          c.followup <= addDays(today(), 6),
      )
      .sort((a, b) => a.followup.localeCompare(b.followup)),
    unpaid = db.invoices
      .filter((i) => balance(i) > 0)
      .sort((a, b) => a.due.localeCompare(b.due));
  let nm = db.settings.owner.split(" ")[0] || "there";
  return (
    heading(
      `Business overview`,
      `Income, expenses and balances in ${db.settings.currency}. Foreign-currency records use saved manual exchange rates.`,
      monthControl() + btn("New invoice", "openInvoice()", true, "plus"),
    ) +
    `${!db.clients.length && !db.invoices.length ? `<section class="start-card"><div><span class="eyebrow">GETTING STARTED</span><h2>Add your first client</h2><p>Your workspace is ready. Add a client to begin creating projects and invoices.</p></div>${btn("Add your first client", "openClient()", true, "plus")}</section>` : ""}<div class="hero-strip"><div class="hero-copy"><h2>Your business, in focus.</h2><p>Review performance, manage receivables and plan your next steps.</p></div><div class="hero-right"><a class="hero-link" href="#reports">View financial reports ↗</a><div class="arch-art" aria-hidden="true"></div></div></div><div class="metrics">${metric("Income this month", inc, "<b>↗ Payments received</b> · excl. tax", "up")}${metric("Expenses this month", exp, `${db.expenses.filter((e) => e.date.startsWith(month)).length} expenses recorded · excl. tax`, "down")}${metric("Net profit", profit, `${inc > 0 ? Math.round((profit / inc) * 100) : 0}% margin <b> · Net profit margin</b>`, "reports", true)}${metric("Outstanding", out, `<span class="text-danger">${money(over.reduce((s, i) => s + toBase(balance(i), i), 0))} overdue</span> · ${unpaid.length} open invoices`, "invoices")}</div><div class="dashboard-grid"><section class="panel">${chart()}</section><section class="panel tax-panel">${panelHead("Tax planning")}<div class="tax-body"><div class="eyebrow">YOUR TAX SET-ASIDE</div><div class="tax-number">${money((Math.max(0, profit) * db.settings.taxRate) / 100)}</div><span class="pill">${db.settings.taxRate}% of net profit</span><p>Estimated reserve based on positive net profit.<br>Review this amount with your accountant.</p></div><a class="tax-footer" href="#settings"><span>An estimate, not tax advice.</span><span>Adjust rate ↗</span></a></section></div><div class="dashboard-grid"><section class="panel">${panelHead("Invoices requiring attention", "Open invoices, ordered by due date.", "All invoices", "invoices")}${invoiceTable(unpaid.slice(0, 3), true)}<div class="table-bottom"><span>${over.length} overdue invoice${over.length === 1 ? "" : "s"} · review and follow up as needed.</span><span>↗</span></div></section><section class="panel">${panelHead("Upcoming follow-ups", "Follow-ups in the next 7 days.", "Clients", "clients")}<div class="follow-list">${
      due.length
        ? due
            .slice(0, 3)
            .map(
              (c, n) =>
                `<div class="follow-row"><span class="client-icon tone-${n}">${esc(initials(c.company))}</span><div class="details"><a href="#" onclick="openClient('${c.id}');return false"><strong>${esc(c.company || c.name)}</strong></a><small>${esc(c.status === "Proposal" ? "Proposal follow-up" : c.status === "Lead" ? "Initial contact" : "Client check-in")}</small></div><span class="follow-date">${c.followup === today() ? "Today" : new Date(c.followup + "T12:00:00").toLocaleDateString(db.settings.locale, { weekday: "short", day: "numeric" })}</span></div>`,
            )
            .join("")
        : '<div class="empty">No follow-ups scheduled in the next 7 days.</div>'
    }</div></section></div><section class="panel" style="margin-bottom:21px"><div class="quick-actions"><span class="quick-label">QUICK ACTIONS</span>${btn("Add client", "openClient()", false, "clients")}${btn("Add invoice", "openInvoice()", false, "invoices")}${btn("Add expense", "openExpense()", false, "plus")}<a class="text-link" href="#projects" style="margin-left:auto">View projects ↗</a></div></section><section class="panel">${panelHead("Top clients", "Ranked by total invoiced value.", "All clients", "clients")}<div class="table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"><table><thead><tr><th>Client</th><th>Relationship</th><th>Total billed</th><th>Outstanding</th></tr></thead><tbody>${[
      ...db.clients,
    ]
      .sort((a, b) => billed(b) - billed(a))
      .slice(0, 3)
      .map(
        (c, n) =>
          `<tr><td>${clientCell(c, n)}</td><td>${badge(c.status)}</td><td>${money(billed(c))}</td><td>${money(owing(c))}</td></tr>`,
      )
      .join("")}</tbody></table></div></section>`
  );
}
function clientsPage() {
  let list = db.clients.filter(
    (c) =>
      (c.name + " " + c.company + " " + c.email)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All" || c.status === filter),
  );
  return (
    heading(
      "Clients",
      "Manage client details, pipeline stages and follow-ups.",
      btn("Add client", "openClient()", true, "plus"),
      "CLIENT MANAGEMENT",
    ) +
    `<div class="toolbar"><input class="search" placeholder="Search clients…" aria-label="Search clients" value="${esc(query)}" oninput="searchPage(this.value)"><select aria-label="Client status" onchange="filter=this.value;render()">${["All", "Lead", "Proposal", "Won", "Lost"].map((s) => `<option ${filter === s ? "selected" : ""}>${s}</option>`).join("")}</select><span class="spacer"></span><div class="segmented"><button class="${clientView === "table" ? "active" : ""}" onclick="clientView='table';render()">Table</button><button class="${clientView === "board" ? "active" : ""}" onclick="clientView='board';render()">Pipeline</button></div></div>` +
    (clientView === "board"
      ? `<div class="board">${["Lead", "Proposal", "Won", "Lost"]
          .map(
            (s) =>
              `<section class="board-col"><h3>${s}<span>${list.filter((c) => c.status === s).length}</span></h3>${list
                .filter((c) => c.status === s)
                .map(
                  (c, n) =>
                    `<div class="board-card" tabindex="0" role="button" onclick="openClient('${c.id}')" onkeydown="if(event.key==='Enter')openClient('${c.id}')">${clientCell(c, n)}<span class="amount">${money(billed(c))} billed</span><p>${money(owing(c))} outstanding</p><p>Follow-up: ${fmtDate(c.followup)}</p></div>`,
                )
                .join("")}</section>`,
          )
          .join("")}</div>`
      : `<section class="panel"><div class="table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"><table><thead><tr><th>Client</th><th>Status</th><th>Total billed</th><th>Outstanding</th><th>Follow-up</th><th></th></tr></thead><tbody>${list.map((c, n) => `<tr><td>${clientCell(c, n)}</td><td>${badge(c.status)}</td><td>${money(billed(c))}</td><td>${money(owing(c))}</td><td>${fmtDate(c.followup)}</td><td><button class="text-link" onclick="openClient('${c.id}')">Edit ↗</button></td></tr>`).join("")}</tbody></table></div>${!list.length ? '<div class="empty">No clients found. Add a client or adjust your filters.</div>' : ""}</section>`)
  );
}
function projectsPage() {
  return (
    heading(
      "Projects",
      "Track project details, deadlines and task completion.",
      btn("New project", "openProject()", true, "plus"),
      "WORK MANAGEMENT",
    ) +
    `<div class="project-grid">${
      db.projects
        .map((p) => {
          let done = p.tasks.filter((t) => t.done).length;
          return `<section class="panel project-card"><div style="display:flex;justify-content:space-between">${badge(p.status)}<span class="eyebrow">${esc(p.type)}</span></div><h3>${esc(p.name)}</h3><p>${esc(client(p.client)?.company || client(p.client)?.name || "No client")}</p><div class="project-meta"><strong>${unitMoney(p.rate, p.currency)}${p.type === "Hourly" ? " / hr" : p.type === "Retainer" ? " / month" : ""}</strong><span>${done}/${p.tasks.length} tasks</span></div><div class="progress"><i style="width:${p.tasks.length ? (done / p.tasks.length) * 100 : 0}%"></i></div>${p.tasks.map((t, n) => `<label class="task ${t.done ? "done" : ""}"><input type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTask('${p.id}',${n},this.checked)"><span>${esc(t.text)}</span></label>`).join("")}<div class="project-foot"><span>Due ${fmtDate(p.deadline)}</span><button class="text-link" onclick="openProject('${p.id}')">Edit project ↗</button></div></section>`;
        })
        .join("") ||
      '<div class="empty">No projects yet. Create a project to track your work.</div>'
    }</div>`
  );
}
function invoicesPage() {
  let list = db.invoices
    .filter(
      (i) =>
        (
          i.number +
          " " +
          client(i.client)?.company +
          " " +
          client(i.client)?.name
        )
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "All" || status(i) === filter),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    heading(
      "Invoices",
      "Create invoices and track due dates, payments and balances.",
      btn("Export CSV", "exportCSV('invoices')", false, "download") +
        btn("New invoice", "openInvoice()", true, "plus"),
      "INVOICES & RECEIVABLES",
    ) +
    `<div class="toolbar"><input class="search" placeholder="Search invoice or client…" aria-label="Search invoices" value="${esc(query)}" oninput="searchPage(this.value)"><select aria-label="Invoice status" onchange="filter=this.value;render()">${["All", "Pending", "Partial", "Paid", "Overdue"].map((s) => `<option ${filter === s ? "selected" : ""}>${s}</option>`).join("")}</select><span class="spacer"></span><span class="subtitle">${list.length} invoices</span></div><section class="panel">${invoiceTable(list)}</section>`
  );
}
function paymentsPage() {
  return (
    heading(
      "Payments",
      "Record payments received and reconcile invoice balances.",
      btn("Record payment", "openPayment()", true, "plus"),
      "PAYMENT RECORDS",
    ) +
    `<section class="panel"><div class="table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"><table><thead><tr><th>Date</th><th>Invoice / client</th><th>Amount</th><th>Mode</th><th>Reference</th><th></th></tr></thead><tbody>${[
      ...db.payments,
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (p) =>
          `<tr><td>${fmtDate(p.date)}</td><td><strong>${esc(invoice(p.invoice)?.number)}</strong><small>${esc(client(invoice(p.invoice)?.client)?.company)}</small></td><td title="${esc(invoice(p.invoice)?.currency)}">${money(p.amount, invoice(p.invoice)?.currency)}</td><td>${esc(p.mode)}</td><td>${esc(p.reference) || "—"}</td><td><button class="text-link" onclick="deletePayment('${p.id}')">Remove</button></td></tr>`,
      )
      .join(
        "",
      )}</tbody></table></div>${!db.payments.length ? '<div class="empty">No payments recorded. Record a payment against an outstanding invoice.</div>' : ""}</section>`
  );
}
function expensesPage() {
  let list = db.expenses
    .filter(
      (e) =>
        e.date.startsWith(month) &&
        (e.vendor + " " + e.category)
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    heading(
      "Expenses",
      "Track operating costs, tax input and project-related expenses.",
      btn("Export CSV", "exportCSV('expenses')", false, "download") +
        btn("Add expense", "openExpense()", true, "plus"),
      "EXPENSE MANAGEMENT",
    ) +
    `<div class="toolbar">${monthControl()}<input class="search" placeholder="Search vendor or category…" aria-label="Search expenses" value="${esc(query)}" oninput="searchPage(this.value)"><span class="spacer"></span><strong>${money(list.reduce((s, e) => s + toBase(e.amount, e), 0))} <span class="subtitle">before tax</span></strong></div><section class="panel"><div class="table-wrap" role="region" aria-label="Scrollable data table" tabindex="0"><table><thead><tr><th>Date</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Tax input</th><th>Project</th><th></th></tr></thead><tbody>${list.map((e) => `<tr><td>${fmtDate(e.date)}</td><td>${esc(e.vendor)}<small>${esc(client(e.client)?.company || "Business expense")}</small></td><td>${esc(e.category)}</td><td title="${esc(e.currency)}">${money(e.amount, e.currency)}</td><td title="${esc(e.currency)}">${money(e.gst, e.currency)}</td><td>${esc(project(e.project)?.name || "—")}</td><td><button class="text-link" onclick="openExpense('${e.id}')">Edit ↗</button></td></tr>`).join("")}</tbody></table></div>${!list.length ? '<div class="empty">No expenses this month.</div>' : ""}</section>`
  );
}
function reportsPage() {
  let profit = income(month) - expense(month),
    over = db.invoices.filter((i) => status(i) === "Overdue"),
    age = (i) => Math.floor((new Date(today()) - new Date(i.due)) / 86400000);
  return (
    heading(
      "Financial reports",
      `Reporting currency: ${db.settings.currency}. Cash basis, saved manual exchange rates.`,
      monthControl(),
      "BUSINESS REPORTING",
    ) +
    `<div class="metrics">${metric("Income received", income(month), `Base ${db.settings.currency} · excluding tax`, "up")}${metric("Expenses", expense(month), "Expense dates · excluding tax", "down")}${metric("Net profit", profit, `Base ${db.settings.currency} · income less expenses`, "reports", true)}${metric("Tax set-aside", (Math.max(0, profit) * db.settings.taxRate) / 100, `${db.settings.taxRate}% estimate · not tax advice`, "shield")}</div><div class="dashboard-grid"><section class="panel">${chart()}</section><section class="panel">${panelHead("Outstanding by client", "All-time unpaid balances, including tax.")}<div class="follow-list">${
      db.clients
        .filter((c) => owing(c) > 0)
        .map(
          (c, n) =>
            `<div class="follow-row"><div class="details"><strong>${esc(c.company || c.name)}</strong></div><span class="amount">${money(owing(c))}</span></div>`,
        )
        .join("") || '<div class="empty">No outstanding balances.</div>'
    }</div></section></div><section class="panel" style="padding:23px;margin-bottom:20px"><h2 style="font-size:14px;margin:0 0 20px">Overdue ageing <span class="subtitle">· as of ${fmtDate(today())}</span></h2><div class="report-summary">${[
      [0, 30, "0–30 days"],
      [31, 60, "31–60 days"],
      [61, Infinity, "60+ days"],
    ]
      .map(([min, max, label]) =>
        metric(
          label,
          over
            .filter((i) => age(i) >= min && age(i) <= max)
            .reduce((s, i) => s + toBase(balance(i), i), 0),
          max === Infinity
            ? "More than 60 days overdue"
            : "Days past invoice due date",
          "invoices",
        ),
      )
      .join(
        "",
      )}</div><p class="report-note">Income is recognised on payment dates, excluding proportional invoice tax, at each payment’s saved exchange rate. Expenses exclude tax input and use their saved rate. Outstanding balances use invoice rates. All consolidated totals are in ${esc(db.settings.currency)}. Net profit is a cash-basis estimate, not statutory accounts. The set-aside is ${db.settings.taxRate}% of positive net profit; it is not a local tax liability calculation.</p><div class="backup-actions">${btn("Invoices CSV", "exportCSV('invoices')", false, "download")}${btn("Expenses CSV", "exportCSV('expenses')", false, "download")}</div></section>`
  );
}
function field(
  label,
  name,
  value = "",
  type = "text",
  full = false,
  extra = "",
) {
  return `<label class="field ${full ? "full" : ""}">${label}<input type="${type}" name="${name}" value="${esc(value)}" ${extra}></label>`;
}
function area(label, name, value = "", full = true) {
  return `<label class="field ${full ? "full" : ""}">${label}<textarea name="${name}">${esc(value)}</textarea></label>`;
}
function selectField(label, name, options, value = "", full = false) {
  return `<label class="field ${full ? "full" : ""}">${label}<select name="${name}">${options
    .map((o) => {
      let [v, l] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}" ${String(v) === String(value) ? "selected" : ""}>${esc(l)}</option>`;
    })
    .join("")}</select></label>`;
}
const clientOptions = () => [
  ["", "Select client"],
  ...db.clients.map((c) => [c.id, c.company || c.name]),
];
const projectOptions = () => [
  ["", "No linked project"],
  ...db.projects.map((p) => [p.id, p.name]),
];
function settingsPage() {
  const s = db.settings;
  return (
    heading(
      "Settings",
      "Manage your profile, regional preferences, currencies and data.",
      "",
      "WORKSPACE SETTINGS",
    ) +
    `<div class="settings-grid"><form class="panel form-panel" onsubmit="saveSettings(event)"><h2>Business profile</h2><p>Your business and payment details appear on invoices.</p><div class="form-grid">${field("Business name", "name", s.name, "text", false, "required")}${field("Your name", "owner", s.owner)}${field("Business email", "email", s.email, "email")}${field("Tax registration ID", "gstin", s.gstin)}${area("Business address", "address", s.address)}<label class="field full">Business logo<img id="settings-logo-preview" class="logo-preview" ${s.logo ? `src="${s.logo}"` : "hidden"} alt="Business logo"><input type="file" accept="image/png,image/jpeg,image/webp" onchange="uploadLogo(this)"><small>PNG, JPG or WebP · maximum 500 KB · saved immediately</small><button type="button" id="remove-logo" class="text-link" ${s.logo ? "" : "hidden"} onclick="removeLogo()">Remove logo</button></label>${field("Payment link or account ID", "upi", s.upi)}${field("Invoice prefix", "prefix", s.prefix, "text", false, 'required maxlength="20"')}${area("Bank / IBAN / SWIFT / payment instructions", "bank", s.bank)}${field("Payment terms (days)", "terms", s.terms, "number", false, 'required min="0" max="365" step="1"')}</div><h2 class="section-divider">Region and reporting</h2><div class="form-grid">${regionalFields(s, hasRecords())}</div><h2 class="section-divider">Tax defaults</h2><div class="form-grid">${taxSettingsFields(s)}</div><div class="form-actions"><button class="btn primary" type="submit">Save changes</button></div></form><div class="stack"><form class="panel form-panel" onsubmit="saveRates(event)"><h2>Default exchange rates</h2><p>Base currency: <strong>${esc(s.currency)}</strong>. Enter how many base-currency units equal 1 unit of each foreign currency. Rates are manual defaults, not live quotes.</p><div id="rate-rows">${rateRows(s.rates)}</div><button type="button" class="btn small" onclick="$('#rate-rows').insertAdjacentHTML('beforeend',rateRow())">+ Add currency rate</button><div style="margin-top:18px">${field("Rate reference date (optional)", "ratesDate", s.ratesDate, "date")}</div><p class="report-note">Use the rate appropriate to each transaction. Existing invoices, payments and expenses keep their saved rates when these defaults change.</p><div class="form-actions"><button type="submit" class="btn primary">Save exchange rates</button></div></form><section class="panel form-panel"><h2>Backup and restore</h2><p>Export a full JSON backup before moving browsers or changing your workspace. Imports replace all settings and records, including currencies and rates.</p><div class="backup-actions">${btn("Export backup", "backup()", true, "download")}<button class="btn" onclick="$('#restore-file').click()">Restore JSON</button></div><input type="file" hidden id="restore-file" accept="application/json,.json" onchange="restore(this)"></section><section class="panel form-panel"><h2>Workspace data</h2><p>These actions replace data. Export a backup first. Clearing records retains your profile and allows you to choose a new base currency.</p><div class="backup-actions"><button class="btn" onclick="resetData(false)">Load demo data (optional)</button><button class="btn danger" onclick="resetData(true)">Clear business records</button><button class="btn danger" onclick="restartSetup()">Start fresh with profile setup</button></div></section><section class="panel form-panel" style="background:var(--celadon)"><div class="eyebrow">DEVELOPED BY</div><h2>ClarCraft</h2><p>Docket · v1.4<br>Independent business management, with regional formats and offline multi-currency records.</p><a href="#developer" class="text-link">Developer information ↗</a></section></div></div>`
  );
}
function guidePage() {
  return (
    heading(
      "Setup guide & FAQ",
      "Installation, regional settings, currency handling and product limitations.",
      "",
      "DOCUMENTATION",
    ) +
    `<div class="guide-content"><section class="panel"><h2>01. Set up your workspace</h2><p>Open the hosted Docket address over HTTPS. Load it online once until Ready for offline use appears. Use Install app or your browser menu to install where supported. No backend or account is required. Direct file URLs and embedded previews cannot install a PWA.</p><p>First visits start with an empty workspace. Choose your country/region, number locale, date display and base reporting currency, then configure your invoice defaults. The interface stays in English; number and date formatting follow your locale. Region does not automatically set tax rules.</p></section><section class="panel"><h2>02. Currencies and manual rates</h2><p>Search dropdowns by name, symbol or code; use arrow keys and Enter, or Escape to cancel. Amounts use currency symbols. Codes remain in FX instructions, exports and invoice identification; a browser may use a code where no localised symbol exists. Choose a currency on each invoice, expense and project. For invoices and expenses, enter how many base-currency units equal one foreign-currency unit. For example, if your base is USD and the invoice is EUR, a rate of 1.08 means 1 EUR = 1.08 USD. These are illustrative values, not current quotes.</p><p>Save reusable default rates in Settings. Rates are never fetched automatically. Every transaction saves its own rate; changing a default does not change history. Payments are recorded in the invoice currency and may use a different rate on the receipt date. Zero-decimal and three-decimal currencies use their ISO currency precision.</p><p>Reports, client totals and outstanding balances use the base currency. Income is received payments, excluding proportional invoice tax, converted at each payment's rate. Expenses exclude tax input and use their saved rate. Outstanding uses remaining invoice balance at the invoice's saved rate. Converted receipt income and expenses are rounded per transaction to the base currency’s precision before totals are added. No mark-to-market revaluation, separate FX gain/loss ledger or historical rate service is provided.</p><p>The base currency is locked once any records exist so changing a setting cannot silently relabel totals. Export a backup and clear records to start a workspace with a different base currency. This is not an automatic base-currency migration.</p></section><section class="panel"><h2>03. Tax and invoices</h2><p>Use your own tax label, such as VAT, GST or sales tax. Set a default rate or leave it at 0% to start with tax off. Single tax uses one rate; two-component tax splits the total rate equally and allows custom labels. Invoice tax labels and rates are saved on each invoice.</p><p>Tax IDs and payment instructions are generic text fields. Use the bank, IBAN, SWIFT, routing, account or payment-link information relevant to your business. No payment is processed or verified by Docket. Use invoice preview → Print / PDF to share an invoice yourself. Print on A4 and disable browser headers/footers. Long invoices repeat table headings; Chromium also prints page numbers and the invoice reference. Review the final preview before sending.</p><p>Tax reserve is an editable percentage of positive net profit, not a tax liability calculation. Docket does not determine tax registration, sales-tax nexus, place of supply, input-credit eligibility, exemptions, withholding, tax-inclusive pricing, multiple independent tax rates, local e-invoicing or country-specific invoice compliance. Confirm your requirements with a qualified local adviser.</p></section><section class="panel"><h2>04. Common questions</h2><details open><summary>Where is my data, and how do I back it up?</summary><p>Data is stored in localStorage for this browser and origin. Export JSON in Settings regularly. JSON imports replace the complete workspace, including region, currencies, rates and logos; they do not merge. CSV exports are for analysis, not restoration. Clearing browser data or changing browsers/devices/origins requires a backup.</p></details><details><summary>How do installation and updates work?</summary><p>Load the app online once to cache its files, then install through the browser where supported. Records stay in localStorage; offline caching and installation are not backups or cloud sync. Update available asks before reloading the current tab; finish unsaved work first. Other open tabs are not forcibly reloaded. If an installation opens empty, restore your exported JSON backup.</p></details><details><summary>Will older Docket backups still work?</summary><p>Yes. Original single-currency backups are explicitly migrated as INR records with a rate of 1, Indian number formatting and their existing GST labels. They are not relabelled as another currency. Existing amounts and payment balances are preserved.</p></details><details><summary>What does Pending, Partial, Paid or Overdue mean?</summary><p>Paid means no balance remains in the invoice currency. A positive balance after the due date is Overdue, even if some payment has been received. Otherwise the status is Partial when payments exist, or Pending when no payment exists. Remove incorrect payments and record replacements.</p></details><details><summary>Can I use it with a team or sync between devices?</summary><p>No. This is a single-user, browser-local app without authentication, encryption at rest, cloud sync, automated backups or an audit trail. Anyone with access to your browser profile may access your records. Keep secure backups.</p></details><details><summary>Does the country setting translate the app or guarantee local compliance?</summary><p>No. The interface is English, with configurable date and number formats. Tax and payment fields are flexible, but Docket is not local accounting software or a country-specific compliance service.</p></details></section><section class="panel"><h2>05. Licence and developer</h2><p>Developed by ClarCraft. The draft buyer licence permits use and modification for one personal or commercial business, but not redistribution as a competing template. Review LICENSE.md before commercial distribution. Third-party fonts retain their own licences. The public-distribution app uses Instrument Serif and DM Sans under SIL OFL. General Sans binaries are not bundled. Public repository visibility does not grant an open-source licence.</p><a href="#developer" class="text-link">About ClarCraft ↗</a></section></div>`
  );
}
const pages = {
  dashboard,
  clients: clientsPage,
  projects: projectsPage,
  invoices: invoicesPage,
  payments: paymentsPage,
  expenses: expensesPage,
  reports: reportsPage,
  settings: settingsPage,
  guide: guidePage,
  developer: developerPage,
};
function render() {
  if (!db.onboarded) {
    renderOnboarding();
    return;
  }
  document.body.classList.remove("onboarding");
  if (!pages[page]) page = "dashboard";
  $("#nav").innerHTML = [
    "dashboard",
    "clients",
    "projects",
    "invoices",
    "payments",
    "expenses",
    "reports",
    "settings",
    "developer",
  ]
    .map(
      (p, n) =>
        `${p === "settings" ? '<div class="nav-divider"></div>' : ""}<a href="#${p}" ${p === page ? 'aria-current="page"' : ""} class="${p === page ? "active" : ""}">${icon(p)}<span>${p === "dashboard" ? "Overview" : p[0].toUpperCase() + p.slice(1)}</span>${p === "invoices" && db.invoices.some((i) => status(i) === "Overdue") ? `<span class="nav-count">${db.invoices.filter((i) => status(i) === "Overdue").length}</span>` : ""}</a>`,
    )
    .join("");
  $("#crumb").textContent =
    page === "dashboard"
      ? "Overview"
      : page === "guide"
        ? "Setup guide"
        : page[0].toUpperCase() + page.slice(1);
  $(".workspace strong").textContent = db.settings.name || "Your workspace";
  $$(".avatar").forEach((a) => (a.textContent = initials(db.settings.name)));
  $("#main").innerHTML = pages[page]();
  if (page === "settings" && hasRecords())
    $("#main [name=currency]").disabled = true;
  enhanceTables();
}
function closeSidebar() {
  $("#sidebar").classList.remove("open");
  document.body.classList.remove("nav-open");
  $("#menu").setAttribute("aria-expanded", "false");
}
function navigate(route, writeHistory = true) {
  if (!pages[route]) route = "dashboard";
  page = route;
  query = "";
  filter = "All";
  closeSidebar();
  if ($("#modal").open) closeModal();
  if (writeHistory) {
    try {
      if (location.hash !== "#" + route)
        history.pushState(null, "", "#" + route);
    } catch {
      /* Rendering works even when embedded history is restricted. */
    }
  }
  render();
  window.scrollTo(0, 0);
}
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (
    !link ||
    link.hasAttribute("onclick") ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const route = link.getAttribute("href").slice(1);
  if (pages[route]) {
    event.preventDefault();
    navigate(route);
  }
});
window.addEventListener("hashchange", () =>
  navigate(location.hash.slice(1), false),
);
window.addEventListener("popstate", () =>
  navigate(location.hash.slice(1), false),
);
$("#menu").onclick = () => {
  const open = $("#sidebar").classList.toggle("open");
  document.body.classList.toggle("nav-open", open);
  $("#menu").setAttribute("aria-expanded", String(open));
};
$("#nav-backdrop").onclick = closeSidebar;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSidebar();
});
function searchPage(v) {
  query = v;
  let pos = document.activeElement.selectionStart;
  render();
  let el = $(".search");
  el.focus();
  el.setSelectionRange(pos, pos);
}
function showModal(title, body) {
  $("#modal-content").innerHTML =
    `<div class="modal-head"><h2 id="dialog-title">${title}</h2><button class="close" aria-label="Close dialog" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div>`;
  if (!$("#modal").open) $("#modal").showModal();
  enhanceTables();
}
function closeModal() {
  $("#modal").close();
}
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    let r = $("#modal").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});
function formEnd(id, kind) {
  return `<div class="form-actions">${id ? `<button type="button" class="btn danger" style="margin-right:auto" onclick="deleteRecord('${kind}','${id}')">Delete</button>` : ""}<button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" type="submit">Save ${kind === "clients" ? "client" : kind === "projects" ? "project" : "expense"}</button></div></form>`;
}
function openClient(id) {
  let c = client(id) || {};
  showModal(
    id ? "Edit client" : "Add client",
    `<form onsubmit="saveClient(event,'${id || ""}')"><div class="form-grid">${field("Name *", "name", c.name, "text", false, "required")}${field("Company", "company", c.company)}${field("Email", "email", c.email, "email")}${field("Phone", "phone", c.phone, "tel")}${field("Tax registration ID", "gstin", c.gstin)}${field("Source", "source", c.source)}${selectField("Relationship status", "status", ["Lead", "Proposal", "Won", "Lost"], c.status || "Lead")}${field("Next follow-up", "followup", c.followup, "date")}${area("Billing address", "address", c.address)}${area("Notes", "notes", c.notes)}</div>${formEnd(id, "clients")}`,
  );
}
const formData = (e) => {
  e.preventDefault();
  return Object.fromEntries(new FormData(e.target));
};
function saveClient(e, id) {
  let d = formData(e);
  d.name = d.name.trim();
  if (!d.name) return toast("Please enter a client name.");
  upsert("clients", { ...d, id: id || uid() });
}
function upsert(key, obj) {
  let ix = db[key].findIndex((a) => a.id === obj.id);
  if (ix >= 0) db[key][ix] = obj;
  else db[key].push(obj);
  let ok = save();
  closeModal();
  render();
  if (ok) toast("Record saved successfully.");
}
function openProject(id) {
  let p = project(id) || {};
  showModal(
    id ? "Edit project" : "New project",
    `<form onsubmit="saveProject(event,'${id || ""}')"><div class="form-grid">${field("Project name *", "name", p.name, "text", true, "required")}${selectField("Client", "client", clientOptions(), p.client)}${selectField("Currency", "currency", currencyOptions(), p.currency || db.settings.currency)}${selectField("Project type", "type", ["Fixed", "Hourly", "Retainer"], p.type)}${field("Rate (selected currency)", "rate", p.rate || 0, "number", false, 'min="0" step="0.000001" required')}${selectField("Status", "status", ["Planned", "Active", "On hold", "Completed"], p.status || "Active")}${field("Start date", "start", p.start || today(), "date")}${field("Deadline", "deadline", p.deadline, "date")}${area("Tasks · one per line", "tasks", (p.tasks || []).map((t) => t.text).join("\n"))}${area("Notes", "notes", p.notes)}</div>${formEnd(id, "projects")}`,
  );
}
function saveProject(e, id) {
  let d = formData(e),
    old = project(id);
  d.name = d.name.trim();
  if (!d.name) return toast("Please enter a project name.");
  d.rate = +d.rate;
  d.tasks = d.tasks
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      done: old?.tasks.find((t) => t.text === text)?.done || false,
    }));
  if (d.start && d.deadline && d.deadline < d.start)
    return toast("Deadline must be on or after the start date.");
  upsert("projects", { ...d, id: id || uid() });
}
function toggleTask(id, n, done) {
  project(id).tasks[n].done = done;
  save();
  render();
}
function openExpense(id) {
  const x = db.expenses.find((e) => e.id === id) || {},
    c = x.currency || db.settings.currency;
  showModal(
    id ? "Edit expense" : "Add expense",
    `<form id="expense-form" onsubmit="saveExpense(event,'${id || ""}')"><div class="form-grid">${field("Date *", "date", x.date || today(), "date", false, "required")}${selectField("Category", "category", ["Software", "Workspace", "Contractors", "Travel", "Marketing", "Equipment", "Utilities", "Other"], x.category)}${field("Vendor *", "vendor", x.vendor, "text", true, "required")}${fxFields(x)}${field("Amount before tax *", "amount", x.amount ?? "", "number", false, `required data-money-input min="${currencyUnit(c)}" step="${currencyUnit(c)}"`)}${field("Tax input amount", "gst", x.gst || 0, "number", false, `required data-money-input min="0" step="${currencyUnit(c)}"`)}${selectField("Client (optional)", "client", clientOptions(), x.client)}${selectField("Project (optional)", "project", projectOptions(), x.project)}${area("Notes", "notes", x.notes)}</div>${formEnd(id, "expenses")}`,
  );
  bindFX($("#expense-form"));
}
function saveExpense(e, id) {
  const fx = readFX(e.target),
    d = formData(e);
  if (!fx) return;
  d.vendor = d.vendor.trim();
  if (!d.vendor) return toast("Please enter a vendor name.");
  d.amount = roundMoney(+d.amount, fx.currency);
  d.gst = roundMoney(+d.gst, fx.currency);
  if (
    !Number.isFinite((d.amount + d.gst) * fx.exchangeRate) ||
    d.amount <= 0 ||
    d.gst < 0
  )
    return toast("Enter valid finite expense and tax amounts.");
  if (d.project && d.client && project(d.project)?.client !== d.client)
    return toast("Choose a project belonging to this client.");
  upsert("expenses", { ...d, ...fx, id: id || uid() });
}
async function deleteRecord(kind, id) {
  if (
    kind === "clients" &&
    (db.invoices.some((i) => i.client === id) ||
      db.projects.some((p) => p.client === id) ||
      db.expenses.some((e) => e.client === id))
  )
    return toast(
      "This client has linked records. Remove or reassign those first.",
    );
  if (
    kind === "projects" &&
    (db.invoices.some((i) => i.project === id) ||
      db.expenses.some((e) => e.project === id))
  )
    return toast(
      "This project has linked invoices or expenses. Reassign those first.",
    );
  if (kind === "invoices" && db.payments.some((p) => p.invoice === id))
    return toast("Remove linked payments before deleting this invoice.");
  if (!(await confirmAction("Delete this record? This cannot be undone.")))
    return;
  db[kind] = db[kind].filter((x) => x.id !== id);
  save();
  closeModal();
  render();
  toast("Record deleted.");
}
let draftItems = [];
function nextNumber() {
  let n = 1001,
    p = db.settings.prefix;
  for (let i of db.invoices) {
    if (i.number.startsWith(p)) {
      let x = Number(i.number.slice(p.length));
      if (Number.isFinite(x)) n = Math.max(n, x + 1);
    }
  }
  return p + n;
}
function openInvoice(id) {
  if (!db.clients.length) {
    toast("Add your first client before creating an invoice.");
    return openClient();
  }
  const i = invoice(id) || {},
    s = db.settings,
    hasPaid = id && paid(i) > 0;
  draftItems = JSON.parse(
    JSON.stringify(i.items || [{ description: "", qty: 1, rate: 0 }]),
  );
  showModal(
    id ? "Edit invoice" : "New invoice",
    `<form id="invoice-form" data-legacy-rounding="${i.legacyRounding ? "true" : "false"}" onsubmit="saveInvoice(event,'${id || ""}')">${hasPaid ? '<p class="report-note">This invoice has payments. Currency cannot be changed and total cannot be reduced below receipts.</p>' : ""}<div class="form-grid">${field("Invoice number *", "number", i.number || nextNumber(), "text", false, "required")}${selectField("Client *", "client", clientOptions(), i.client)}${field("Invoice date *", "date", i.date || today(), "date", false, "required")}${field("Due date *", "due", i.due || addDays(today(), +s.terms), "date", false, "required")}${selectField("Linked project", "project", projectOptions(), i.project)}${selectField("Preferred payment mode", "mode", PAYMENT_MODES, i.mode || "Bank transfer")}${fxFields(i)}</div><div class="table-wrap" role="region" aria-label="Data table" tabindex="0"><table class="line-items"><thead><tr><th>Description</th><th class="qty">Qty</th><th class="rate">Unit rate</th><th style="width:35px"></th></tr></thead><tbody id="item-rows"></tbody></table></div><button type="button" class="btn small" onclick="draftItems.push({description:'',qty:1,rate:0});renderItems()">+ Add line item</button><div class="form-grid" style="margin-top:22px"><label class="check-field"><input type="checkbox" name="gst" ${(i.gst ?? s.gstRate > 0) ? "checked" : ""} onchange="calcDraft()"> Apply tax</label>${selectField(
      "Tax presentation",
      "gstType",
      [
        ["igst", "Single tax"],
        ["split", "Two equal components"],
      ],
      i.gstType || s.taxMode,
    )}${field("Tax label", "taxLabel", i.taxLabel || s.taxLabel, "text", false, 'required maxlength="40"')}${field("Tax rate (%)", "gstRate", i.gstRate ?? s.gstRate, "number", false, 'required min="0" max="100" step="0.01" oninput="calcDraft()"')}${field("First component label", "taxPartA", i.taxPartA || s.taxPartA, "text", false, 'required maxlength="40"')}${field("Second component label", "taxPartB", i.taxPartB || s.taxPartB, "text", false, 'required maxlength="40"')}${area("Invoice notes", "notes", i.notes ?? "Thank you for your business. Please include the invoice number with your payment.")}</div><div class="invoice-totals" id="draft-totals"></div><div class="form-actions">${id ? `<button class="btn danger" type="button" onclick="deleteRecord('invoices','${id}')" style="margin-right:auto">Delete</button>` : ""}<button type="button" class="btn" onclick="closeModal()">Cancel</button><button type="submit" class="btn primary">Save invoice</button></div></form>`,
  );
  $("#invoice-form [name=client]").required = true;
  renderItems();
  bindFX($("#invoice-form"), calcDraft);
}
function renderItems() {
  $("#item-rows").innerHTML = draftItems
    .map(
      (x, n) =>
        `<tr><td><input aria-label="Item description" placeholder="Service or item description" value="${esc(x.description)}" required oninput="draftItems[${n}].description=this.value"></td><td><input aria-label="Quantity" type="number" min="0.01" step="0.01" required value="${x.qty}" oninput="draftItems[${n}].qty=+this.value;calcDraft()"></td><td><input aria-label="Rate" type="number" min="0" step="0.000001" required value="${x.rate}" oninput="draftItems[${n}].rate=+this.value;calcDraft()"></td><td><button type="button" aria-label="Remove item" onclick="if(draftItems.length>1){draftItems.splice(${n},1);renderItems()}">×</button></td></tr>`,
    )
    .join("");
  calcDraft();
}
function calcDraft() {
  const f = $("#invoice-form");
  if (!f) return;
  const i = {
    items: draftItems,
    gst: f.elements.gst.checked,
    gstRate: +f.elements.gstRate.value,
    currency: f.elements.currency.value,
    legacyRounding:
      f.dataset.legacyRounding === "true" &&
      f.elements.currency.value === "INR",
    exchangeRate: +f.elements.exchangeRate.value,
  };
  $("#draft-totals").innerHTML =
    `<div><span>Subtotal</span><span>${money(sub(i), i.currency)}</span></div><div><span>Tax</span><span>${money(tax(i), i.currency)}</span></div><div class="total"><span>Total</span><span>${money(total(i), i.currency)}</span></div>${i.currency !== db.settings.currency ? `<div><span>Reporting equivalent</span><span>${money(toBase(total(i), i))}</span></div>` : ""}`;
}
function saveInvoice(e, id) {
  const fx = readFX(e.target),
    d = formData(e);
  if (!fx) return;
  Object.assign(d, fx);
  d.legacyRounding = Boolean(
    id && invoice(id)?.legacyRounding && fx.currency === "INR",
  );
  d.gst = e.target.elements.gst.checked;
  d.gstRate = +d.gstRate;
  d.items = JSON.parse(JSON.stringify(draftItems));
  d.number = d.number.trim();
  for (const k of ["taxLabel", "taxPartA", "taxPartB"]) d[k] = d[k].trim();
  if (
    !d.number ||
    !d.items.length ||
    d.items.some(
      (x) =>
        !x.description.trim() ||
        !Number.isFinite(x.qty) ||
        !Number.isFinite(x.rate) ||
        x.qty <= 0 ||
        x.rate < 0,
    ) ||
    !Number.isFinite(total(d) * fx.exchangeRate)
  )
    return toast("Add a description and valid quantity and rate.");
  if (!d.taxLabel || !d.taxPartA || !d.taxPartB)
    return toast("Tax labels cannot be blank.");
  if (d.due < d.date)
    return toast("Due date cannot be before the invoice date.");
  if (d.project && project(d.project)?.client !== d.client)
    return toast("This project belongs to a different client.");
  if (db.invoices.some((i) => i.number === d.number && i.id !== id))
    return toast("That invoice number is already in use.");
  if (id && paid(invoice(id)) > 0 && d.currency !== invoice(id).currency)
    return toast(
      "Cannot change currency on an invoice with payments. Remove its payments first.",
    );
  if (id && total(d) < paid(invoice(id)))
    return toast("Invoice total cannot be less than payments received.");
  d.id = id || uid();
  upsert("invoices", d);
  viewInvoice(d.id);
}
function invoiceHTML(i) {
  const c = client(i.client) || {},
    s = db.settings,
    cc = i.currency,
    half = roundMoney(tax(i) / 2, cc);
  const amount = (n) =>
    new Intl.NumberFormat(s.locale, {
      style: "currency",
      currency: cc,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: currencyDigits(cc),
      maximumFractionDigits: currencyDigits(cc),
    }).format(n);
  const number = (n) =>
    new Intl.NumberFormat(s.locale, { maximumFractionDigits: 6 }).format(n);
  const lineTotal = (x) => roundMoney(x.qty * x.rate, cc);
  const aggregateNote =
    legacyInvoice(i) &&
    roundMoney(
      i.items.reduce((v, x) => v + lineTotal(x), 0),
      cc,
    ) !== sub(i);
  return `<article class="invoice-paper" aria-label="Invoice ${esc(i.number)}">
    <div class="invoice-top"><div class="invoice-business">${s.logo ? `<img src="${s.logo}" class="invoice-logo" alt="Business logo">` : ""}<h2>${esc(s.name)}</h2>${s.address ? `<p>${esc(s.address)}</p>` : ""}${s.email ? `<p>${esc(s.email)}</p>` : ""}${s.gstin ? `<p><strong>Tax ID:</strong> ${esc(s.gstin)}</p>` : ""}</div><div class="invoice-reference"><div class="eyebrow">${i.gst ? "TAX INVOICE" : "INVOICE"}</div><h1>${esc(i.number)}</h1>${badge(status(i))}<p class="invoice-currency">Currency: ${esc(cc)} · ${esc(currencySymbol(cc))}</p></div></div>
    <section class="invoice-info"><div class="invoice-client"><h4>BILL TO</h4><p><strong>${esc(c.company || c.name || "Client")}</strong>${c.company && c.name ? `<br>${esc(c.name)}` : ""}</p>${c.address ? `<p>${esc(c.address)}</p>` : ""}${c.email ? `<p>${esc(c.email)}</p>` : ""}${c.phone ? `<p>${esc(c.phone)}</p>` : ""}${c.gstin ? `<p><strong>Tax ID:</strong> ${esc(c.gstin)}</p>` : ""}</div><div class="invoice-dates"><h4>INVOICE DETAILS</h4><dl><div><dt>Invoice date</dt><dd>${fmtDate(i.date)}</dd></div><div><dt>Due date</dt><dd>${fmtDate(i.due)}</dd></div>${i.project ? `<div><dt>Project</dt><dd>${esc(project(i.project)?.name || "")}</dd></div>` : ""}</dl></div></section>
    <div class="invoice-table-wrap" tabindex="0" role="region" aria-label="Invoice line items; scroll horizontally on small screens"><table class="invoice-lines"><colgroup><col style="width:44%"><col style="width:10%"><col style="width:22%"><col style="width:24%"></colgroup><thead><tr><th scope="col">Description</th><th scope="col" class="numeric">Qty</th><th scope="col" class="numeric">Unit price</th><th scope="col" class="numeric">Amount</th></tr></thead><tbody>${i.items.map((x) => `<tr><td>${esc(x.description)}</td><td class="numeric">${number(x.qty)}</td><td class="numeric">${unitMoney(x.rate, cc)}</td><td class="numeric">${amount(lineTotal(x))}</td></tr>`).join("")}</tbody></table></div>
    ${aggregateNote ? '<p class="invoice-rounding-note">Subtotal retains the original invoice’s aggregate rounding.</p>' : ""}
    <section class="invoice-totals" aria-label="Invoice totals"><div><span>Subtotal</span><span>${amount(sub(i))}</span></div>${i.gst ? (i.gstType === "split" ? `<div><span>${esc(i.taxPartA)} (${number(i.gstRate / 2)}%)</span><span>${amount(half)}</span></div><div><span>${esc(i.taxPartB)} (${number(i.gstRate / 2)}%)</span><span>${amount(tax(i) - half)}</span></div>` : `<div><span>${esc(i.taxLabel)} (${number(i.gstRate)}%)</span><span>${amount(tax(i))}</span></div>`) : ""}<div class="total"><span>Invoice total</span><span>${amount(total(i))}</span></div><div><span>Amount paid</span><span>${amount(paid(i))}</span></div><div class="total invoice-balance"><span>Balance due</span><span>${amount(balance(i))}</span></div></section>
    <section class="payment-info"><h4>PAYMENT DETAILS · ${esc(i.mode)}</h4>${s.upi ? `<p>Payment account / link: ${esc(s.upi)}</p>` : ""}${s.bank ? `<p>${esc(s.bank)}</p>` : ""}${i.notes ? `<div class="invoice-notes"><h4>NOTES & TERMS</h4><p>${esc(i.notes)}</p></div>` : ""}<p class="invoice-reference-note">All amounts in ${esc(cc)}. Please include ${esc(i.number)} as your payment reference.</p></section>
  </article>`;
}
function viewInvoice(id) {
  let i = invoice(id);
  if (!i) return;
  showModal(
    "Invoice preview",
    `<div class="backup-actions" style="margin-bottom:18px">${btn("Print / PDF", `printInvoice('${id}')`, true, "download")}${balance(i) > 0 ? btn("Mark payment", `openPayment('${id}')`) : ""}${btn("Edit invoice", `openInvoice('${id}')`)}</div>${invoiceHTML(i)}`,
  );
}
function printInvoice(id) {
  const record = invoice(id);
  if (!record) return;
  $("#print-area").innerHTML = invoiceHTML(record);
  let meta = document.getElementById("invoice-print-meta");
  if (!meta) {
    meta = document.createElement("style");
    meta.id = "invoice-print-meta";
    document.head.append(meta);
  }
  const reference = Array.from(record.number.slice(0, 70))
    .map((char) => "\\" + char.codePointAt(0).toString(16) + " ")
    .join("");
  meta.textContent = `@page { @bottom-left { content:"Invoice ${reference}"; font-family:Arial,sans-serif; font-size:8pt; color:#81766b; } @bottom-right { content:"Page " counter(page) " of " counter(pages); font-family:Arial,sans-serif; font-size:8pt; color:#81766b; } }`;
  window.print();
}

function openPayment(id) {
  const list = db.invoices.filter((i) => balance(i) > 0);
  if (!list.length)
    return toast("No outstanding invoices available for payment.");
  id = id || list[0].id;
  const i = invoice(id),
    fx =
      i.currency === db.settings.currency
        ? 1
        : (db.settings.rates[i.currency] ?? i.exchangeRate);
  showModal(
    "Record payment",
    `<form id="payment-form" onsubmit="savePayment(event)"><div class="form-grid">${selectField(
      "Invoice *",
      "invoice",
      list.map((i) => [
        i.id,
        `${i.number} · ${client(i.client)?.company || client(i.client)?.name} · ${money(balance(i), i.currency)} due`,
      ]),
      id,
      true,
    )}${field("Payment date *", "date", today(), "date", false, `required max="${today()}"`)}${field(`Amount in ${i.currency} *`, "amount", balance(i), "number", false, `required min="${currencyUnit(i.currency)}" step="${currencyUnit(i.currency)}" max="${balance(i)}"`)}${field(`Exchange rate to ${db.settings.currency}`, "exchangeRate", fx, "number", false, 'required min="0.00000001" max="1000000000" step="any"')}${selectField("Payment mode", "mode", PAYMENT_MODES, i.mode)}${field("Reference / transaction ID", "reference", "", "text", true)}</div><p class="report-note" id="payment-fx-note">Record the amount received in ${i.currency}. 1 ${i.currency} = entered rate in ${db.settings.currency}. Receipts use this saved payment rate for cash-basis reports.</p><div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Cancel</button><button class="btn primary" type="submit">Record payment</button></div></form>`,
  );
  const f = $("#payment-form");
  const update = () => {
    const selected = invoice(f.elements.invoice.value),
      unit = currencyUnit(selected.currency);
    f.elements.amount.value = balance(selected);
    f.elements.amount.max = balance(selected);
    f.elements.amount.min = unit;
    f.elements.amount.step = unit;
    f.elements.amount.parentElement.firstChild.textContent = `Amount in ${selected.currency} *`;
    f.elements.exchangeRate.value =
      selected.currency === db.settings.currency
        ? 1
        : (db.settings.rates[selected.currency] ?? selected.exchangeRate);
    f.elements.exchangeRate.readOnly =
      selected.currency === db.settings.currency;
    $("#payment-fx-note").textContent =
      `Record the amount received in ${selected.currency}. 1 ${selected.currency} = entered rate in ${db.settings.currency}. Receipts use this saved rate for reports.`;
  };
  f.elements.invoice.onchange = update;
  update();
}
function savePayment(e) {
  const d = formData(e),
    i = invoice(d.invoice);
  d.amount = roundMoney(+d.amount, i.currency);
  d.exchangeRate = +d.exchangeRate;
  if (
    !Number.isFinite(d.amount * d.exchangeRate) ||
    d.amount <= 0 ||
    d.amount > balance(i)
  )
    return toast("Enter an amount within the remaining balance.");
  if (
    !validFX(d.exchangeRate) ||
    (i.currency === db.settings.currency && d.exchangeRate !== 1)
  )
    return toast("Enter a valid exchange rate. Base-currency payments use 1.");
  if (d.date > today()) return toast("Payment date cannot be in the future.");
  upsert("payments", { ...d, id: uid() });
}
async function deletePayment(id) {
  if (
    !(await confirmAction(
      "Remove this payment? The invoice balance will be updated.",
    ))
  )
    return;
  db.payments = db.payments.filter((p) => p.id !== id);
  save();
  render();
  toast("Payment removed. Invoice updated.");
}
function saveSettings(e) {
  let d = formData(e);
  d.currency = d.currency || db.settings.currency;
  d.name = d.name.trim();
  d.prefix = d.prefix.trim();
  if (!d.name || !d.prefix)
    return toast("Business name and invoice prefix cannot be blank.");
  d.gstRate = +d.gstRate;
  d.taxRate = +d.taxRate;
  d.terms = +d.terms;
  for (const k of ["taxLabel", "taxPartA", "taxPartB"]) d[k] = d[k].trim();
  if (!validateRegion(d))
    return toast("Check the currency, region, locale tag and tax labels.");
  if (d.currency !== db.settings.currency && hasRecords())
    return toast(
      "Base currency is locked while records exist. Export a backup and clear records before changing it.",
    );
  let rates =
    d.currency === db.settings.currency
      ? db.settings.rates
      : { [d.currency]: 1 };
  db.settings = {
    ...db.settings,
    ...d,
    rates,
    ratesDate: d.currency === db.settings.currency ? db.settings.ratesDate : "",
  };
  if (save())
    toast(
      "Settings saved. Existing transaction currencies, rates and tax labels are unchanged.",
    );
  render();
}
function uploadLogo(input) {
  let f = input.files[0];
  if (!f) return;
  if (
    f.size > 500 * 1024 ||
    !["image/png", "image/jpeg", "image/webp"].includes(f.type)
  )
    return toast("Choose a PNG, JPG or WebP under 500 KB.");
  let r = new FileReader();
  r.onload = () => {
    db.settings.logo = r.result;
    const preview = $("#settings-logo-preview");
    if (preview) {
      preview.src = r.result;
      preview.hidden = false;
      $("#remove-logo").hidden = false;
    }
    if (save()) toast("Logo saved. Save other profile changes below.");
  };
  r.readAsDataURL(f);
}
function removeLogo() {
  db.settings.logo = "";
  const preview = $("#settings-logo-preview");
  if (preview) {
    preview.hidden = true;
    preview.removeAttribute("src");
    $("#remove-logo").hidden = true;
  }
  if (save()) toast("Logo removed. Other profile edits are unchanged.");
}
function download(name, content, type) {
  let a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([content], { type }));
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function backup() {
  download(
    "docket-backup-" + today() + ".json",
    JSON.stringify(db, null, 2),
    "application/json",
  );
  toast("Backup downloaded. Store it in a secure location.");
}
function exportCSV(kind) {
  const b = db.settings.currency;
  const rows =
    kind === "invoices"
      ? [
          [
            "Invoice",
            "Client",
            "Date",
            "Due date",
            "Currency",
            "Exchange rate to " + b,
            "Subtotal",
            "Tax",
            "Total",
            "Paid",
            "Balance",
            "Status",
            "Total in " + b,
            "Balance in " + b,
          ],
          ...db.invoices.map((i) => [
            i.number,
            client(i.client)?.company || client(i.client)?.name,
            i.date,
            i.due,
            i.currency,
            i.exchangeRate,
            sub(i),
            tax(i),
            total(i),
            paid(i),
            balance(i),
            status(i),
            toBase(total(i), i),
            toBase(balance(i), i),
          ]),
        ]
      : [
          [
            "Date",
            "Category",
            "Vendor",
            "Currency",
            "Exchange rate to " + b,
            "Amount before tax",
            "Tax input",
            "Total",
            "Amount before tax in " + b,
            "Client",
            "Project",
            "Notes",
          ],
          ...db.expenses.map((e) => [
            e.date,
            e.category,
            e.vendor,
            e.currency,
            e.exchangeRate,
            e.amount,
            e.gst,
            roundMoney(e.amount + e.gst, e.currency),
            toBase(e.amount, e),
            client(e.client)?.company || "",
            project(e.project)?.name || "",
            e.notes,
          ]),
        ];
  const csv = rows
    .map((r) =>
      r
        .map((v) => {
          v = String(v ?? "");
          if (/^[\s]*[=+@-]/.test(v)) v = "'" + v;
          return '"' + v.replaceAll('"', '""') + '"';
        })
        .join(","),
    )
    .join("\r\n");
  download(
    `docket-${kind}-${today()}.csv`,
    "\ufeff" + csv,
    "text/csv;charset=utf-8",
  );
  toast(`All ${kind} exported, including currency and exchange-rate columns.`);
}
function validCoreBackup(d) {
  if (!d || ![1, 2].includes(d.version) || !d.settings) return false;
  if (d.onboarded !== undefined && typeof d.onboarded !== "boolean")
    return false;
  let s = d.settings;
  for (let k of [
    "name",
    "owner",
    "email",
    "address",
    "gstin",
    "upi",
    "bank",
    "prefix",
    "logo",
  ])
    if (typeof s[k] !== "string") return false;
  if (
    s.logo &&
    !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s.logo)
  )
    return false;
  if (
    ![s.gstRate, s.taxRate].every(
      (n) => Number.isFinite(n) && n >= 0 && n <= 100,
    ) ||
    !Number.isInteger(s.terms) ||
    s.terms < 0 ||
    s.terms > 365
  )
    return false;
  let date = (v) =>
      typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      !isNaN(new Date(v).getTime()) &&
      new Date(v).toISOString().slice(0, 10) === v,
    text = (o, keys) => keys.every((k) => typeof o[k] === "string"),
    num = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0;
  for (let k of ["clients", "projects", "invoices", "payments", "expenses"]) {
    if (!Array.isArray(d[k])) return false;
    let ids = new Set();
    for (let x of d[k]) {
      if (
        !x ||
        typeof x.id !== "string" ||
        !/^[a-zA-Z0-9_-]+$/.test(x.id) ||
        ids.has(x.id)
      )
        return false;
      ids.add(x.id);
    }
  }
  let cid = (id) => d.clients.some((c) => c.id === id),
    pid = (id) => !id || d.projects.some((p) => p.id === id),
    iid = (id) => d.invoices.some((i) => i.id === id);
  for (let c of d.clients)
    if (
      !text(c, [
        "name",
        "company",
        "email",
        "phone",
        "gstin",
        "address",
        "source",
        "status",
        "followup",
        "notes",
      ]) ||
      !["Lead", "Proposal", "Won", "Lost"].includes(c.status) ||
      (c.followup && !date(c.followup))
    )
      return false;
  for (let p of d.projects)
    if (
      !text(p, [
        "name",
        "client",
        "type",
        "start",
        "deadline",
        "status",
        "notes",
      ]) ||
      (p.client && !cid(p.client)) ||
      !["Fixed", "Hourly", "Retainer"].includes(p.type) ||
      !["Planned", "Active", "On hold", "Completed"].includes(p.status) ||
      !num(p.rate) ||
      !Array.isArray(p.tasks) ||
      p.tasks.some(
        (t) => !t || typeof t.text !== "string" || typeof t.done !== "boolean",
      ) ||
      (p.start && !date(p.start)) ||
      (p.deadline && !date(p.deadline))
    )
      return false;
  let nums = new Set();
  for (let i of d.invoices) {
    if (
      !text(i, [
        "number",
        "date",
        "due",
        "client",
        "project",
        "gstType",
        "mode",
        "notes",
      ]) ||
      nums.has(i.number) ||
      !cid(i.client) ||
      !pid(i.project) ||
      !date(i.date) ||
      !date(i.due) ||
      i.due < i.date ||
      typeof i.gst !== "boolean" ||
      !num(i.gstRate) ||
      i.gstRate > 100 ||
      !["split", "igst"].includes(i.gstType) ||
      !Array.isArray(i.items) ||
      !i.items.length ||
      i.items.some(
        (x) =>
          !x ||
          typeof x.description !== "string" ||
          !num(x.qty) ||
          x.qty <= 0 ||
          !num(x.rate),
      )
    )
      return false;
    if (!Number.isFinite(total(i))) return false;
    if (
      i.project &&
      d.projects.find((p) => p.id === i.project)?.client !== i.client
    )
      return false;
    nums.add(i.number);
  }
  for (let p of d.payments)
    if (
      !text(p, ["date", "invoice", "mode", "reference"]) ||
      !iid(p.invoice) ||
      !date(p.date) ||
      !num(p.amount) ||
      p.amount <= 0
    )
      return false;
  for (let i of d.invoices)
    if (
      roundMoney(
        d.payments
          .filter((p) => p.invoice === i.id)
          .reduce((s, p) => s + p.amount, 0),
        recordCurrency(i),
      ) > total(i)
    )
      return false;
  for (let e of d.expenses)
    if (
      !text(e, ["date", "category", "vendor", "client", "project", "notes"]) ||
      !date(e.date) ||
      !num(e.amount) ||
      !num(e.gst) ||
      (e.client && !cid(e.client)) ||
      !pid(e.project)
    )
      return false;
  return true;
}
function validBackup(d) {
  try {
    if (!validCoreBackup(d)) return false;
    if (d.version === 1) return true;
    const s = d.settings;
    if (
      !validateRegion(s) ||
      !s.rates ||
      typeof s.rates !== "object" ||
      Array.isArray(s.rates) ||
      s.rates[s.currency] !== 1 ||
      typeof s.ratesDate !== "string"
    )
      return false;
    if (
      s.ratesDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(s.ratesDate) ||
        isNaN(new Date(s.ratesDate).getTime()) ||
        new Date(s.ratesDate).toISOString().slice(0, 10) !== s.ratesDate)
    )
      return false;
    for (const [c, r] of Object.entries(s.rates))
      if (!CURRENCIES.includes(c) || !validFX(r)) return false;
    const validRecord = (r) =>
      CURRENCIES.includes(r.currency) &&
      validFX(r.exchangeRate) &&
      (r.currency !== s.currency || r.exchangeRate === 1);
    const precise = (n, c) => Math.abs(n - roundMoney(n, c)) < 1e-8;
    for (const i of d.invoices) {
      if (
        !validRecord(i) ||
        !["taxLabel", "taxPartA", "taxPartB"].every(
          (k) =>
            typeof i[k] === "string" &&
            i[k].trim().length > 0 &&
            i[k].length <= 40,
        ) ||
        (i.legacyRounding && i.currency !== "INR") ||
        (i.legacyRounding !== undefined &&
          typeof i.legacyRounding !== "boolean") ||
        !Number.isFinite(total(i) * i.exchangeRate)
      )
        return false;
    }
    for (const e of d.expenses)
      if (
        !validRecord(e) ||
        !precise(e.amount, e.currency) ||
        !precise(e.gst, e.currency) ||
        !Number.isFinite((e.amount + e.gst) * e.exchangeRate)
      )
        return false;
    for (const p of d.projects)
      if (!CURRENCIES.includes(p.currency)) return false;
    for (const p of d.payments) {
      const i = d.invoices.find((i) => i.id === p.invoice);
      if (
        !validFX(p.exchangeRate) ||
        (i.currency === s.currency && p.exchangeRate !== 1) ||
        !precise(p.amount, i.currency) ||
        !Number.isFinite(p.amount * p.exchangeRate)
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function restore(input) {
  let f = input.files[0];
  if (!f) return;
  try {
    if (f.size > 8 * 1024 * 1024) throw Error();
    let d = JSON.parse(await f.text());
    if (!validBackup(d)) throw Error();
    if (
      !(await confirmAction(
        `Import “${f.name}”? This backup contains ${d.clients.length} clients, ${d.projects.length} projects, ${d.invoices.length} invoices, ${d.payments.length} payments and ${d.expenses.length} expenses. Importing replaces all current records and settings. Export a backup first if needed.`,
      ))
    )
      return;
    const imported = {
      ...normaliseWorkspace(d),
      onboarded:
        d.onboarded !== undefined
          ? d.onboarded
          : Boolean(d.settings.name.trim()),
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(imported));
    } catch {
      toast(
        "Import could not be saved. Current records are unchanged. Check browser storage permissions or available space.",
      );
      return;
    }
    db = imported;
    onboardingDraft = { ...db.settings };
    setupStep = 1;
    $(".save-status").innerHTML = "<i></i> Saved locally";
    render();
    toast("Backup restored successfully.");
  } catch {
    toast("Invalid or unsupported backup. No records were changed.");
  } finally {
    input.value = "";
  }
}
async function resetData(empty) {
  if (
    !(await confirmAction(
      empty
        ? "Clear all clients, projects, invoices, payments and expenses? Your business settings will be kept. Export a backup first."
        : "Replace your entire workspace with fictional demo data? Export a backup first.",
    ))
  )
    return;
  let settings = db.settings;
  db = demo();
  db.onboarded = true;
  if (empty) {
    db.settings = settings;
    for (let k of ["clients", "projects", "invoices", "payments", "expenses"])
      db[k] = [];
  }
  save();
  render();
  toast(
    empty
      ? "Business records cleared. Your profile has been retained."
      : "Demo data refreshed.",
  );
}
function renderOnboarding() {
  document.body.classList.add("onboarding");
  closeSidebar();
  const s = onboardingDraft;
  $("#onboarding-root").innerHTML =
    `<div class="setup-top"><a class="brand" href="#dashboard"><span class="brand-mark">d<span>•</span></span>Docket</a><span>${icon("shield", 14)} PRIVATE, LOCAL WORKSPACE</span></div><div class="setup-layout"><section class="setup-story"><div class="eyebrow">BUSINESS MANAGEMENT, SIMPLIFIED</div><h1>Your business.<br>Your finances.<br><em>One workspace.</em></h1><p>Manage clients, projects and finances in one organised workspace. Start by setting up your business profile.</p><div class="setup-illustration" aria-hidden="true"><div class="setup-arch"></div><span>✳</span><div class="setup-note">Business records.<br><i>Organised and accessible.</i></div></div><div class="setup-promise">${icon("shield", 18)}<div><strong>Your data stays in your browser.</strong><small>No account or server required.<br>Export regular backups to keep your records safe.</small></div></div></section><section class="setup-card"><div class="setup-steps"><span class="${setupStep === 1 ? "current" : "complete"}"><b>${setupStep === 1 ? "1" : "✓"}</b>Your profile</span><i></i><span class="${setupStep === 2 ? "current" : ""}"><b>2</b>Invoice defaults</span></div>${storeError ? `<div class="storage-warning">${unreadableBackup ? "Existing browser data could not be read. It has not been overwritten. Download it before creating a new workspace." : "Browser storage is unavailable here. Open the downloaded app in your browser for persistent saving. You can still explore, but export a backup before closing."}${unreadableBackup ? `<button type="button" class="text-link" onclick="download('docket-recovery.json',unreadableBackup,'application/json')">Download existing data ↗</button>` : ""}</div>` : ""}<div class="eyebrow">STEP ${setupStep} OF 2</div><h2>${setupStep === 1 ? "Create your business profile" : "Configure invoice defaults"}</h2><p class="setup-description">${setupStep === 1 ? "These details identify your business on invoices. You can update them in Settings." : "Set your invoice defaults. Payment details are optional for now."}</p><form id="setup-form" onsubmit="submitSetup(event)"><div class="form-grid">${setupStep === 1 ? `${field("Your name *", "owner", s.owner, "text", false, 'required autocomplete="name" placeholder="Your full name"')}${field("Business name *", "name", s.name, "text", false, 'required autocomplete="organization" placeholder="Your studio or business"')}${field("Business email", "email", s.email, "email", true, 'autocomplete="email" placeholder="hello@yourbusiness.com"')}${area("Business address", "address", s.address)}${field("Tax registration ID (optional)", "gstin", s.gstin, "text", true, 'placeholder="Tax / VAT / GST number, if applicable"')}${regionalFields(s)}` : `${field("Invoice prefix *", "prefix", s.prefix, "text", false, 'required maxlength="20"')}${field("Payment terms (days)", "terms", s.terms, "number", false, 'required min="0" max="365" step="1"')}${taxSettingsFields(s)}${field("Payment link or account ID", "upi", s.upi, "text", true, 'placeholder="Optional payment account or URL"')}${area("Bank details", "bank", s.bank)}<p class="report-note field full">Tax defaults are optional. The reserve is a planning estimate, not a calculation of local tax liability.</p>`}</div><div class="setup-actions">${setupStep === 2 ? '<button type="button" class="btn" onclick="backSetup()">← Back</button>' : '<span class="setup-required">* Required fields</span>'}<button type="submit" class="btn primary">${setupStep === 1 ? "Continue" : "Create my workspace"} ${icon("arrow", 15)}</button></div></form><div class="setup-restore"><span>Already have a Docket backup?</span><button type="button" onclick="$('#setup-restore-file').click()">Restore a backup ↗</button><input hidden id="setup-restore-file" type="file" accept=".json,application/json" onchange="restore(this)"></div></section></div><div class="setup-bottom"><span>CLIENTS · PROJECTS · FINANCES</span><span>Docket · Developed by ClarCraft</span></div>`;
}
function captureSetup() {
  const form = $("#setup-form");
  if (form)
    Object.assign(onboardingDraft, Object.fromEntries(new FormData(form)));
}
function backSetup() {
  captureSetup();
  setupStep = 1;
  renderOnboarding();
  window.scrollTo(0, 0);
}
async function submitSetup(e) {
  e.preventDefault();
  captureSetup();
  for (const k of ["name", "owner", "prefix"])
    onboardingDraft[k] = onboardingDraft[k].trim();
  if (!onboardingDraft.name || !onboardingDraft.owner) {
    setupStep = 1;
    renderOnboarding();
    return toast("Please enter your name and business name.");
  }
  if (setupStep === 1) {
    if (
      !CURRENCIES.includes(onboardingDraft.currency) ||
      !validLocale(onboardingDraft.locale)
    )
      return toast("Choose a valid base currency and locale tag.");
    setupStep = 2;
    renderOnboarding();
    window.scrollTo(0, 0);
    return;
  }
  if (!onboardingDraft.prefix) return toast("Please add an invoice prefix.");
  if (
    unreadableBackup &&
    !(await confirmAction(
      "Create a fresh workspace and replace the unreadable browser data? Download the recovery file first if you need it.",
    ))
  )
    return;
  for (const k of ["terms", "gstRate", "taxRate"])
    onboardingDraft[k] = +onboardingDraft[k];
  if (!validateRegion(onboardingDraft))
    return toast("Check region, currency and tax labels.");
  db.settings = {
    ...onboardingDraft,
    rates: { [onboardingDraft.currency]: 1 },
  };
  db.onboarded = true;
  const ok = save();
  unreadableBackup = "";
  $("#onboarding-root").innerHTML = "";
  navigate("dashboard");
  if (ok) toast("Workspace created successfully.");
}
async function restartSetup() {
  if (
    !(await confirmAction(
      "Start again from profile creation? This deletes your profile and all business records. Export a backup first.",
    ))
  )
    return;
  db = blankWorkspace();
  onboardingDraft = { ...db.settings };
  setupStep = 1;
  save();
  navigate("dashboard");
}

// Dispatch validated form submissions ourselves. Sandboxed attachment viewers may
// block native form submission before an onsubmit handler can run.
document.addEventListener("click", (event) => {
  const button = event.target.closest('button,input[type="submit"]');
  if (!button || button.type !== "submit" || !button.form) return;
  event.preventDefault();
  const form = button.form;
  if (form.reportValidity())
    form.dispatchEvent(
      new SubmitEvent("submit", {
        bubbles: true,
        cancelable: true,
        submitter: button,
      }),
    );
});
function confirmAction(message) {
  const dialog = $("#confirm-modal");
  if (dialog.open) return Promise.resolve(false);
  return new Promise((resolve) => {
    dialog.innerHTML = `<div class="modal-head"><h2 id="confirm-title">Confirm action</h2></div><div class="modal-body"><p class="confirm-message">${esc(message)}</p><div class="form-actions"><button type="button" class="btn" autofocus data-confirm-cancel>Cancel</button><button type="button" class="btn primary" data-confirm-accept>Yes, continue</button></div></div>`;
    let settled = false;
    const cancel = (event) => {
      event.preventDefault();
      finish(false);
    };
    const finish = (confirmed) => {
      if (settled) return;
      settled = true;
      dialog.removeEventListener("cancel", cancel);
      dialog.close(confirmed ? "confirm" : "cancel");
      resolve(confirmed);
    };
    dialog
      .querySelector("[data-confirm-cancel]")
      .addEventListener("click", () => finish(false));
    dialog
      .querySelector("[data-confirm-accept]")
      .addEventListener("click", () => finish(true));
    dialog.addEventListener("cancel", cancel);
    dialog.showModal();
  });
}

function enhanceTables() {
  tableObserver.disconnect();
  $$(".table-wrap").forEach((region) => tableObserver.observe(region));
}
const tableObserver = new ResizeObserver((entries) => {
  for (const { target: region } of entries) {
    const table = region.querySelector("table");
    const scrollable = !!table && table.scrollWidth > region.clientWidth + 1;
    region.classList.toggle("is-scrollable", scrollable);
    region.setAttribute(
      "aria-label",
      scrollable
        ? "Data table. Scroll horizontally to view all columns."
        : "Data table",
    );
  }
});

// Initialise only after all validators and calculation helpers are available.
try {
  const stored = localStorage.getItem(KEY);
  if (stored) {
    unreadableBackup = stored;
    const parsed = JSON.parse(stored);
    if (!validBackup(parsed)) throw new Error("Invalid stored workspace");
    db = normaliseWorkspace(parsed);
    db.onboarded = parsed.onboarded !== undefined ? parsed.onboarded : true;
    unreadableBackup = "";
  }
} catch {
  storeError = true;
  $(".save-status").textContent = "Storage needs attention";
}
let setupStep = 1,
  onboardingDraft = { ...db.settings };
page = location.hash.slice(1) || "dashboard";
render();
if (storeError)
  toast(
    "Browser data could not be loaded. No existing storage has been overwritten.",
  );
