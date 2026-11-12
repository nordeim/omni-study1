// S178 net probe — the edit-mode persistence mechanism: does the reference
// PATCH during typing (autosave) or commit on X/Save? Network spy on the
// edit legs. Trusted clicks (getByRole exact — the hasText-regex trap
// recorded this session).
import { chromium } from "playwright";
const REF = "https://omni-study1.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.waitForFunction(() => {
  const btn = document.querySelector("button[type=submit]");
  return btn !== null && !btn.disabled;
}, null, { timeout: 15000 });
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2000);
await page.getByRole("link", { name: /^Notes/ }).click();
await page.waitForTimeout(2500);

const net = [];
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("/api/")) {
    net.push({ phase: "log", method: r.method(), url: u.replace(REF, "").slice(0, 80) });
  }
});
const out = { net: [] };
const snap = (phase) => { out.net.push({ phase, calls: net.map((c) => `${c.method} ${c.url}`), total: net.length }); net.length = 0; };

// create the probe note
await page.getByRole("button", { name: "New Note" }).first().click({ timeout: 8000 });
await page.locator("input[placeholder='Note title...']").waitFor({ state: "visible", timeout: 8000 });
await page.waitForTimeout(1200);
await page.locator("input[placeholder='Note title...']").fill("S178 net probe — delete me");
const body = page.locator(".ql-editor[contenteditable='true']");
await body.click({ timeout: 5000 });
await body.type("net probe body", { delay: 30 });
await page.waitForTimeout(600);
net.length = 0;
await page.getByRole("button", { name: "Save", exact: true }).first().click({ timeout: 6000 });
await page.waitForTimeout(2500);
snap("create-save");
out.viewModeAfterCreate = await page.evaluate(() => {
  const t = document.querySelector("main input[placeholder*='title']");
  return { titleDisabled: t ? t.disabled : null, prose: !!document.querySelector("main .prose.note-content, main [class*='note-content']") };
});

// edit leg: click Edit, type, wait 7s — network during typing?
await page.getByRole("button", { name: "Edit", exact: true }).first().click({ timeout: 6000 });
await page.waitForTimeout(1500);
const ed = page.locator(".ql-editor[contenteditable='true']");
await ed.click({ timeout: 5000 });
await ed.type(" AUTOSAVE-CHECK", { delay: 30 });
await page.waitForTimeout(7000);
snap("edit-typing-7s");

// X exit — network on exit?
await page.evaluate(() => {
  const btns = [...document.querySelectorAll("main button")];
  const b = btns.find((el) => el.querySelector("svg[class*='x']") && !el.textContent.trim() && el.getBoundingClientRect().width < 60 && !((el.getAttribute("aria-label") || "").match(/tag|notebook/i)));
  if (b) b.click();
});
await page.waitForTimeout(2500);
snap("x-exit");
out.stateAfterX = await page.evaluate(() => {
  const t = document.querySelector("main input[placeholder*='title']");
  const prose = document.querySelector("main .prose, main [class*='note-content']");
  return { titleDisabled: t ? t.disabled : null, proseText: prose ? (prose.textContent || "").trim().slice(0, 60) : null };
});

// edit again + Save — network on save?
await page.getByRole("button", { name: "Edit", exact: true }).first().click({ timeout: 6000 });
await page.waitForTimeout(1500);
const ed2 = page.locator(".ql-editor[contenteditable='true']");
await ed2.click({ timeout: 5000 });
await ed2.type(" FINAL", { delay: 30 });
await page.waitForTimeout(400);
snap("edit2-typing");
await page.getByRole("button", { name: "Save", exact: true }).first().click({ timeout: 6000 });
await page.waitForTimeout(2500);
snap("save-click");
out.stateAfterSave = await page.evaluate(() => {
  const t = document.querySelector("main input[placeholder*='title']");
  const prose = document.querySelector("main .prose, main [class*='note-content']");
  return { titleDisabled: t ? t.disabled : null, proseText: prose ? (prose.textContent || "").trim().slice(0, 60) : null };
});

// cleanup: trash direct
await page.evaluate(() => {
  const btns = [...document.querySelectorAll("main button")];
  const b = btns.find((el) => el.querySelector("svg[class*='trash']")) || btns.find((el) => (el.getAttribute("aria-label") || "").match(/delete|trash/i));
  if (b) b.click();
});
await page.waitForTimeout(2500);
snap("trash-delete");
out.residue = await page.evaluate(() => {
  const aside = document.querySelector("aside");
  const txt = (aside ? aside.textContent : "") || (document.querySelector("main") ? document.querySelector("main").textContent : "");
  return { s178residue: /S178 net probe/i.test(txt) };
});
console.log(JSON.stringify(out, null, 1));
await ctx.close();
await browser.close();
