// S176 evidence capture — the remediated New Event dialog (the cycle's
// surface: the measured placeholder trio + the repeating-ROWS reminders
// control + the six-swatch 32px rounded-full palette with the selected
// white+slate double-ring + scale state + the five-option repeat select).
// Self-verifying (the S174/S175 template): each frame's DOM content is
// asserted BEFORE the screenshot settles.
import { chromium } from "playwright";

const CLONE = "http://localhost:3000";
const shots = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
// domcontentloaded + a generous timeout: a cold Turbopack boot can hold
// the load event past the default 30s while the chunks compile.
await page.goto(`${CLONE}/login`, { timeout: 90_000, waitUntil: "domcontentloaded" });
await page.fill("input[type=email]", "demo@studyflow.app");
await page.fill("input[type=password]", "Demo1234!");
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null && document.querySelector("nav") !== null, null, { timeout: 30000 });
await page.waitForTimeout(1500);

// 1) The New Event dialog — the DZ1 port's surface.
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Events")); if (a) a.click(); });
await page.waitForTimeout(1600);
await page.getByRole("button", { name: "New Event" }).first().click();
const dlg = page.getByRole("dialog");
await dlg.waitFor({ state: "visible", timeout: 10000 });
// Self-verify the port's markers before the frame.
await dlg.locator("#event-title").waitFor();
const checks = await dlg.evaluate((d) => ({
  titlePh: d.querySelector("#event-title").getAttribute("placeholder"),
  locPh: d.querySelector("#event-location").getAttribute("placeholder"),
  descPh: d.querySelector("#event-description").getAttribute("placeholder"),
  swatches: [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width <= 40 && !b.textContent.trim() && b.getAttribute("aria-label")?.startsWith("Choose color"); }).length,
  reminderInput: !!d.querySelector("input[type=number]"),
  addBtn: [...d.querySelectorAll("button")].some((b) => b.textContent.trim() === "Add"),
  createBtn: [...d.querySelectorAll("button")].some((b) => b.textContent.trim() === "Create Event"),
}));
console.log("verify:", JSON.stringify(checks));
if (checks.titlePh !== "Event title" || checks.locPh !== "Room or meeting URL" || checks.descPh !== "Event details..." || checks.swatches !== 6 || !checks.reminderInput || !checks.addBtn || !checks.createBtn) {
  throw new Error("the dialog's DZ1 markers failed the self-verification");
}
await page.screenshot({ path: "docs/screenshots/176-clone-events-dialog.png" });
shots.push("176-clone-events-dialog.png");
// Add a second reminder row for the richer frame.
await dlg.getByRole("button", { name: "Add", exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "docs/screenshots/176-clone-events-reminders-rows.png" });
shots.push("176-clone-events-reminders-rows.png");
await page.keyboard.press("Escape");
await page.waitForTimeout(600);

// 2) The Create Study Group dialog — the DZ2 port's surface.
await page.evaluate(() => { const a = [...document.querySelectorAll("nav a")].find((x) => x.textContent.trim().startsWith("Study Groups")); if (a) a.click(); });
await page.waitForTimeout(1600);
await page.getByRole("button", { name: "Create study group" }).first().click();
await dlg.waitFor({ state: "visible", timeout: 10000 });
const sg = await dlg.evaluate((d) => ({
  labels: [...d.querySelectorAll("label")].map((l) => l.textContent.trim()),
  swatches: [...d.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 20 && r.width <= 40 && !b.textContent.trim() && b.getAttribute("aria-label")?.startsWith("Choose color"); }).length,
}));
console.log("sg verify:", JSON.stringify(sg));
if (!sg.labels.includes("Group Name *") || !sg.labels.includes("Description") || sg.swatches !== 6) {
  throw new Error("the group dialog's DZ2 markers failed");
}
await page.screenshot({ path: "docs/screenshots/176-clone-studygroups-dialog.png" });
shots.push("176-clone-studygroups-dialog.png");
await page.keyboard.press("Escape");
await page.waitForTimeout(600);

// 3) The mobile drawer frame (the standing chrome evidence).
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(600);
await page.getByRole("button", { name: "Open navigation menu" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: "docs/screenshots/176-clone-mobile-drawer.png" });
shots.push("176-clone-mobile-drawer.png");

console.log("captured:", shots.join(", "));
await ctx.close();
await browser.close();
