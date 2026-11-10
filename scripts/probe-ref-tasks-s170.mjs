// S170 one-shot probe — the reference's Tasks view: the My Lists sidebar
// area (any create/edit/delete list UI?), the aside structure, and the
// task dialog's field set. Decides the superset question for the taskList
// family (the clone's mutations have no view consumers today).
import { chromium } from "playwright";

const REF = "https://omni-study1.base44.app";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${REF}/login`);
await page.fill("input[type=email]", process.env.REF_PROBE_EMAIL);
await page.fill("input[type=password]", process.env.REF_PROBE_PASSWORD);
await page.click("button[type=submit]");
await page.waitForFunction(() => document.querySelector("main") !== null, null, { timeout: 30000 });
await page.waitForTimeout(2500);

// Navigate to Tasks.
await page.evaluate(`(() => {
  const link = [...document.querySelectorAll("a")].find((a) => a.textContent.trim().startsWith("Tasks"));
  if (link) link.click();
})()`);
await page.waitForTimeout(2500);

const info = await page.evaluate(`(() => {
  const main = document.querySelector("main");
  if (!main) return { main: null };
  const aside = main.querySelector("aside") || document.querySelector("aside:not([class*='fixed'])");
  // Buttons in the whole view + in the aside region.
  const buttons = [...main.querySelectorAll("button")].map((b) => (b.textContent || b.getAttribute("aria-label") || "").replace(/\\s+/g, " ").trim().slice(0, 40)).filter(Boolean);
  // The left column of the tasks view (filters + My Lists).
  const leftText = aside ? aside.textContent.replace(/\\s+/g, " ").slice(0, 300) : null;
  const headings = [...main.querySelectorAll("h1, h2, h3, p[class*='uppercase']")].map((h) => h.textContent.replace(/\\s+/g, " ").trim().slice(0, 40)).slice(0, 12);
  return { heading: main.querySelector("h1") ? main.querySelector("h1").textContent.trim() : null, buttons: buttons.slice(0, 20), leftText, headings };
})()`);
console.log(JSON.stringify(info, null, 1));

// Open the task dialog (if an "Add Task" button exists) and dump its fields.
const addBtn = page.getByRole("button", { name: /add task/i }).first();
if (await addBtn.count()) {
  await addBtn.click();
  await page.waitForTimeout(1000);
  const dlg = await page.evaluate(`(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return null;
    const labels = [...d.querySelectorAll("label")].map((l) => l.textContent.trim().slice(0, 30));
    const selects = [...d.querySelectorAll("select")].map((s) => ({ label: s.getAttribute("aria-label") || (s.previousElementSibling && s.previousElementSibling.textContent || "").slice(0, 30), options: [...s.options].slice(0, 6).map((o) => o.textContent.trim().slice(0, 25)) }));
    return { labels, selects, title: d.querySelector("h2") ? d.querySelector("h2").textContent.trim() : null };
  })()`);
  console.log("task dialog:", JSON.stringify(dlg, null, 1));
  await page.keyboard.press("Escape");
}

await ctx.close();
await browser.close();
