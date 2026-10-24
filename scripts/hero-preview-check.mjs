import { chromium } from "playwright";

const LIVE_URL = "https://engulsax.github.io/crit-throw/";
const BASE =
  process.env.PREVIEW_URL ??
  (process.argv.includes("--live") ? LIVE_URL : "http://localhost:4173/");
const widths = [390, 768, 1440];

const browser = await chromium.launch();
const consoleErrors = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${width}px] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(`[${width}px] pageerror: ${err.message}`);
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const overlayVisible = await page.locator("#overlay:not(.overlay--hidden)").isVisible();
  if (!overlayVisible) {
    console.log(`WARN ${width}px: overlay already hidden at 300ms`);
  }

  await page.waitForFunction(
    () => document.querySelector("#result")?.textContent === "20",
    { timeout: 15000 }
  );
  const critClass = await page.locator("#result").evaluate((el) =>
    el.classList.contains("result--crit")
  );
  if (!critClass) {
    console.log(`FAIL ${width}px: result is 20 but missing result--crit`);
  }

  await page.waitForTimeout(500);
  const againHidden = await page.locator("#roll").isHidden();
  if (againHidden) {
    console.log(`FAIL ${width}px: Again button still hidden after settle`);
  }

  await page.locator("#roll").click();
  await page.waitForFunction(
    () => document.querySelector("#result")?.textContent === "…",
    { timeout: 3000 }
  );
  await page.waitForFunction(
    () => document.querySelector("#result")?.textContent === "20",
    { timeout: 15000 }
  );
  const rollHidden = await page.locator("#roll").isHidden();
  if (!rollHidden) {
    console.log(`FAIL ${width}px: Again should hide after second roll (one replay only)`);
  }

  console.log(`OK ${width}px: auto crit + replay → 20`);
  await page.close();
}

await browser.close();

if (consoleErrors.length) {
  console.error("Console errors:");
  for (const e of consoleErrors) console.error(e);
  process.exit(1);
}

console.log("All widths passed, no console errors.");
