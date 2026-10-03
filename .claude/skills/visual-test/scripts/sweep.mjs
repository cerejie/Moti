// Moti visual sweep: every role × screen × size × theme, measured and screenshotted.
// Credentials come from env vars only (MOTI_OWNER, MOTI_EMPLOYEE, MOTI_PW) — never write them here.
// Usage (from the scratchpad, where playwright-core is installed):
//   OUT=<scratchpad>/shots PW=<scratchpad>/node_modules/playwright-core/index.js node sweep.mjs
// Optional: ROLES=signed-out,owner,employee  SIZES=phone,tablet,desktop  THEMES=light,dark
//           SCREENS=transaction,inventory (screen names to keep)  BASE=http://127.0.0.1:4180
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const pw = await import(process.env.PW ? pathToFileURL(process.env.PW).href : "playwright-core");
const chromium = pw.chromium ?? pw.default.chromium;

const BASE = process.env.BASE ?? "http://127.0.0.1:4180";
const OUT = process.env.OUT;
const EDGE = process.env.EDGE ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
if (!OUT) throw new Error("Set OUT to a folder in the session scratchpad");

const ACCOUNTS = { owner: process.env.MOTI_OWNER, employee: process.env.MOTI_EMPLOYEE };
const SIZES = {
  phone: { width: 360, height: 780 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 900 },
};
const pick = (env, all) => (env ? env.split(",").filter((x) => all.includes(x)) : all);
const roles = pick(process.env.ROLES, ["signed-out", "owner", "employee"]);
const sizes = pick(process.env.SIZES, Object.keys(SIZES));
const themes = pick(process.env.THEMES, ["light", "dark"]);
const onlyScreens = process.env.SCREENS?.split(",");

// Reads pass through; every write is answered with an empty 200 so a sweep never changes data.
const READ_RPC = /\/rpc\/(login_email|my_authority_role|inventory_summary)\b/;

// Screens per role. `expect` is where a typed URL must land (route-guard check).
const SCREENS = {
  "signed-out": [
    { name: "login", path: "/login" },
    { name: "register", path: "/register" },
    { name: "forgot", path: "/forgot-password" },
    { name: "guard-inventory", path: "/inventory", expect: "/login" },
  ],
  owner: [
    { name: "dashboard", path: "/" },
    { name: "transaction", path: "/transaction" },
    { name: "inventory", path: "/inventory" },
    { name: "masterfile", path: "/inventory/masterfile" },
    { name: "movements", path: "/movements" },
    { name: "users", path: "/users" },
    { name: "account", path: "/account" },
  ],
  employee: [
    { name: "transaction", path: "/transaction" },
    { name: "account", path: "/account" },
    { name: "guard-dashboard", path: "/", expect: "/transaction" },
    { name: "guard-inventory", path: "/inventory", expect: "/transaction" },
    { name: "guard-masterfile", path: "/inventory/masterfile", expect: "/transaction" },
    { name: "guard-movements", path: "/movements", expect: "/transaction" },
    { name: "guard-users", path: "/users", expect: "/transaction" },
  ],
};

// Overlays opened on top of a screen; each closes with Escape.
const SHEETS = {
  owner: [
    { name: "bell", path: "/", open: (p) => p.getByRole("button", { name: /^Notifications/ }).first().click() },
    { name: "account-menu", path: "/", open: (p) => p.getByRole("button", { name: /^Account menu/ }).first().click() },
    { name: "item-form", path: "/inventory", open: (p) => p.getByRole("button", { name: "Add item" }).first().click() },
    { name: "cart", path: "/transaction", open: openCart },
    { name: "txn-detail", path: "/transaction", open: openTransaction },
  ],
  employee: [
    { name: "bell", path: "/transaction", open: (p) => p.getByRole("button", { name: /^Notifications/ }).first().click() },
    { name: "account-menu", path: "/transaction", open: (p) => p.getByRole("button", { name: /^Account menu/ }).first().click() },
    { name: "cart", path: "/transaction", open: openCart },
  ],
};

async function openCart(page) {
  await page.locator("main").getByRole("button", { name: /^Add/ }).filter({ hasNot: page.locator("[disabled]") }).first().click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Review & checkout/ }).click();
}

async function openTransaction(page) {
  await page.getByRole("tab", { name: "History" }).click();
  await settle(page);
  const card = page.locator("main button").filter({ hasText: /^#\d+/ });
  if (await card.count()) await card.first().click();
  else await page.locator("main [role=row]").nth(1).click();
}

const settle = async (page, ms = 700) => {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
};

// Sideways scroll, clipped scroll boxes, controls past the right edge, sub-44 px touch targets.
const measure = (page, touch) =>
  page.evaluate((touch) => {
    const vw = window.innerWidth;
    // React Aria's visually hidden helpers (1 px dismiss buttons, hidden selects) are not targets.
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 2 || r.height <= 2 || el.closest("[tabindex='-1'] select, select[tabindex='-1']")) return false;
      const s = getComputedStyle(el);
      return s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
    };
    const describe = (el) =>
      (el.getAttribute("aria-label") || el.innerText || el.getAttribute("placeholder") || el.tagName)
        .trim().replace(/\s+/g, " ").slice(0, 40);
    const clipped = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!visible(el)) continue;
      const s = getComputedStyle(el);
      // Ellipsis and line clamps are deliberate truncation, not clipping.
      if (!["hidden", "clip"].includes(s.overflowX) || s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none") continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 120) clipped.push(`${el.tagName.toLowerCase()} "${describe(el).slice(0, 30)}" ${el.scrollWidth}>${el.clientWidth}`);
    }
    const offscreen = [];
    for (const el of document.querySelectorAll("button, a[href], th, [role=tab], [role=columnheader]")) {
      if (visible(el) && el.getBoundingClientRect().right > vw + 1) offscreen.push(describe(el));
    }
    const small = new Set();
    if (touch) {
      const interactive = "button, a[href], [role=tab], [role=button], [role=checkbox], [role=radio], [role=menuitem], [role=switch], input:not([type=hidden]), select, textarea";
      for (const el of document.querySelectorAll(interactive)) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (Math.min(r.width, r.height) < 44) small.add(`${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
    }
    return {
      overflow: document.documentElement.scrollWidth > vw + 1,
      clipped: clipped.slice(0, 6),
      offscreen: offscreen.slice(0, 6),
      small: [...small].slice(0, 12),
      h1: document.querySelector("h1")?.innerText.trim() ?? "",
      skeleton: document.querySelectorAll("[data-slot=skeleton]").length,
      alert: document.querySelectorAll("[role=alert]").length,
    };
  }, touch);

// The shell's content panel scrolls, not the document, so grow the viewport to show it all.
const tallShot = async (page, file, base) => {
  const extra = await page.evaluate(() => {
    let best = 0;
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if (!["auto", "scroll"].includes(s.overflowY) || el.clientHeight <= 200) continue;
      best = Math.max(best, el.scrollHeight - el.clientHeight);
    }
    return best;
  });
  if (extra > 4) await page.setViewportSize({ width: base.width, height: Math.min(base.height + extra, 5000) });
  await page.screenshot({ path: file, type: "jpeg", quality: 72 });
  if (extra > 4) await page.setViewportSize(base);
};

const report = [];
const errors = [];

const capture = async (page, ctx, name, { tall = true, expect } = {}) => {
  await settle(page);
  const dir = path.join(OUT, ctx.role);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}-${ctx.size}-${ctx.theme}.jpg`);
  const finalPath = new URL(page.url()).pathname;
  const m = await measure(page, ctx.size !== "desktop");
  if (tall) await tallShot(page, file, SIZES[ctx.size]);
  else await page.screenshot({ path: file, type: "jpeg", quality: 72 });
  const issues = [
    ...(expect && finalPath !== expect ? [`landed ${finalPath}, expected ${expect}`] : []),
    ...(m.overflow ? ["sideways scroll"] : []),
    ...m.clipped.map((c) => `clipped ${c}`),
    ...m.offscreen.map((o) => `offscreen ${o}`),
    ...m.small.map((s) => `small ${s}`),
  ];
  const row = { ...ctx, screen: name, file: path.relative(OUT, file).replace(/\\/g, "/"), finalPath, h1: m.h1, issues };
  report.push(row);
  console.log(`${issues.length ? "!!" : "ok"} ${ctx.role} ${ctx.size} ${ctx.theme} ${name} -> ${finalPath}${issues.length ? ` | ${issues.join(" | ")}` : ""}`);
};

const step = async (ctx, name, fn) => {
  try {
    await fn();
  } catch (error) {
    report.push({ ...ctx, screen: name, failed: String(error).split("\n")[0].slice(0, 200), issues: ["step failed"] });
    console.log(`!! ${ctx.role} ${ctx.size} ${ctx.theme} ${name} FAILED ${String(error).split("\n")[0].slice(0, 160)}`);
  }
};

const keep = (list) => list.filter((s) => !onlyScreens || onlyScreens.includes(s.name));

const run = async (page, ctx) => {
  for (const screen of keep(SCREENS[ctx.role] ?? [])) {
    await step(ctx, screen.name, async () => {
      await page.goto(BASE + screen.path);
      await capture(page, ctx, screen.name, { expect: screen.expect ?? screen.path });
      if (screen.expect) return;
      const tabs = page.locator("main").getByRole("tab");
      const count = await tabs.count();
      for (let i = 1; i < count; i += 1) {
        const label = (await tabs.nth(i).innerText()).trim().toLowerCase().replace(/\W+/g, "-") || `tab${i}`;
        await tabs.nth(i).click();
        await capture(page, ctx, `${screen.name}-tab-${label}`, { expect: screen.path });
      }
    });
  }
  for (const sheet of keep(SHEETS[ctx.role] ?? [])) {
    await step(ctx, sheet.name, async () => {
      await page.goto(BASE + sheet.path);
      await settle(page);
      await sheet.open(page);
      await capture(page, ctx, sheet.name, { tall: false });
      await page.keyboard.press("Escape");
    });
  }
};

const gallery = () => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const size = sizes.includes("phone") ? "phone" : sizes[0];
  const rows = [];
  for (const role of roles) {
    const names = [...new Set(report.filter((r) => r.role === role && r.size === size).map((r) => r.screen))];
    for (const name of names) {
      const cells = themes.map((theme) => report.find((r) => r.role === role && r.size === size && r.theme === theme && r.screen === name));
      const issues = [...new Set(cells.flatMap((c) => c?.issues ?? []))];
      rows.push(`<section><h2>${esc(role)} · ${esc(name)}</h2>${issues.length ? `<ul>${issues.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="ok">No issues measured</p>`}<div class="pair">${cells
        .map((c, i) => (c?.file ? `<figure><img loading="lazy" src="${esc(c.file)}" alt="${esc(`${role} ${name} ${themes[i]}`)}"><figcaption>${themes[i]}</figcaption></figure>` : `<figure><p>${esc(c?.failed ?? "not captured")}</p></figure>`))
        .join("")}</div></section>`);
    }
  }
  const total = report.filter((r) => r.issues.length).length;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Moti Visual Sweep</title><style>
:root{--bg:#f6f6f4;--fg:#1c1917;--muted:#78716c;--card:#fff;--line:#e7e5e4;--bad:#c2410c;--good:#15803d}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0c0a09;--fg:#f5f5f4;--muted:#a8a29e;--card:#1c1917;--line:#292524;--bad:#fb923c;--good:#4ade80}}
:root[data-theme="dark"]{--bg:#0c0a09;--fg:#f5f5f4;--muted:#a8a29e;--card:#1c1917;--line:#292524;--bad:#fb923c;--good:#4ade80}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
main{max-width:860px;margin:0 auto}h1{font-size:22px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 24px}
section{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:0 0 16px}
h2{font-size:16px;margin:0 0 8px;text-transform:capitalize}ul{margin:0 0 12px;padding-left:18px;color:var(--bad);font-size:13px}.ok{color:var(--good);font-size:13px;margin:0 0 12px}
.pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}figure{margin:0}img{width:100%;height:auto;border:1px solid var(--line);border-radius:10px;display:block}
figcaption{color:var(--muted);font-size:12px;margin-top:4px;text-align:center}</style></head><body><main>
<h1>Moti Visual Sweep</h1><p class="sub">${esc(size)} ${esc(SIZES[size].width)} px · ${esc(roles.join(", "))} · ${report.length} captures, ${total} with issues, ${errors.length} console errors · ${esc(new Date().toISOString().slice(0, 16).replace("T", " "))}</p>
${rows.join("\n")}</main></body></html>`;
};

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const sessions = {};
  for (const role of roles.filter((r) => r !== "signed-out")) {
    if (!ACCOUNTS[role] || !process.env.MOTI_PW) throw new Error(`Set MOTI_${role.toUpperCase()} and MOTI_PW`);
    const context = await browser.newContext({ serviceWorkers: "block" });
    const page = await context.newPage();
    await page.goto(`${BASE}/login`);
    await page.getByLabel("Email").fill(ACCOUNTS[role]);
    await page.locator("#password").fill(process.env.MOTI_PW);
    await page.locator("#password").press("Enter");
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20000 });
    await settle(page);
    sessions[role] = await context.storageState();
    await context.close();
  }

  const faked = new Set();
  for (const role of roles) {
    for (const size of sizes) {
      for (const theme of themes) {
        const ctx = { role, size, theme };
        const context = await browser.newContext({
          viewport: SIZES[size],
          colorScheme: theme,
          storageState: sessions[role],
          serviceWorkers: "block",
          hasTouch: size !== "desktop",
          isMobile: size === "phone",
          deviceScaleFactor: 1,
        });
        await context.route(/\/(rest|functions)\/v1\//, (route) => {
          const request = route.request();
          const method = request.method();
          if (["GET", "HEAD", "OPTIONS"].includes(method) || (method === "POST" && READ_RPC.test(request.url()))) return route.continue();
          faked.add(`${method} ${request.url().split("?")[0].replace(/^.*\/v1/, "")}`);
          return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
        });
        await context.addInitScript((t) => {
          localStorage.setItem("moti.theme", JSON.stringify({ state: { theme: t }, version: 0 }));
        }, theme);
        const page = await context.newPage();
        page.on("console", (msg) => {
          if (msg.type() === "error" && !/favicon|DevTools/.test(msg.text())) errors.push({ ...ctx, url: page.url(), text: msg.text().slice(0, 200) });
        });
        page.on("pageerror", (err) => errors.push({ ...ctx, url: page.url(), text: String(err).slice(0, 200) }));
        await run(page, ctx);
        await context.close();
      }
    }
  }
  await browser.close();

  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ report, errors, faked: [...faked] }, null, 1));
  fs.writeFileSync(path.join(OUT, "index.html"), gallery());
  const bad = report.filter((r) => r.issues.length);
  console.log(`\ncaptures ${report.length}, with issues ${bad.length}, failed steps ${report.filter((r) => r.failed).length}, console errors ${errors.length}`);
  for (const e of errors.slice(0, 10)) console.log(`console ${e.role} ${e.size} ${e.theme} ${e.url} ${e.text}`);
  if (faked.size) console.log(`writes faked: ${[...faked].join(", ")}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
